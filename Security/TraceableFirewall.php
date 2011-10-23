<?php

namespace JMS\DebuggingBundle\Security;

use Symfony\Component\Routing\RouterInterface;

use Symfony\Component\Security\Http\Firewall\AbstractAuthenticationListener;

use Symfony\Component\HttpFoundation\Request;
use JMS\DebuggingBundle\HttpFoundation\TraceableRequestMatcher;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Security\Http\FirewallMapInterface;
use Symfony\Component\Security\Http\Firewall;

class TraceableFirewall
{
    private $map;
    private $dispatcher;
    private $contextTrace;
    private $listeners;
    private $exceptionListener;
    private $handlingListener;
    private $listenerTrace;
    private $router;

    /**
     * Constructor.
     *
     * @param FirewallMap              $map        A FirewallMap instance
     * @param EventDispatcherInterface $dispatcher An EventDispatcherInterface instance
     */
    public function __construct(TraceableMap $map, EventDispatcherInterface $dispatcher)
    {
        $this->map = $map;
        $this->dispatcher = $dispatcher;
        $this->calledListeners = new \SplObjectStorage;
    }

    public function setRouter(RouterInterface $router)
    {
        $this->router = $router;
    }

    /**
     * Handles security.
     *
     * @param GetResponseEvent $event An GetResponseEvent instance
     */
    public function onKernelRequest(GetResponseEvent $event)
    {
        if (HttpKernelInterface::MASTER_REQUEST !== $event->getRequestType()) {
            return;
        }

        // register listeners for this firewall
        list($listeners, $exception)
            = $this->map->getListeners($event->getRequest());
        $this->contextTrace = $this->map->getLastTrace();
        $this->listeners = $listeners;
        $this->exceptionListener = $exception;

        if (null !== $exception) {
            $exception->register($this->dispatcher);
        }

        $this->listenerTrace = new \SplObjectStorage;

        // initiate the listener chain
        foreach ($listeners as $listener) {
            $this->listenerTrace[$listener] = array('reason' => null);
            $response = $listener->handle($event);
            $this->listenerTrace[$listener] = array('reason' => $this->getReason($listener, $event->getRequest()));

            if ($event->hasResponse()) {
                $this->handlingListener = $listener;
                break;
            }
        }
    }

    public function getContextTrace()
    {
        return $this->contextTrace;
    }

    public function getListenerTrace()
    {
        return $this->listenerTrace;
    }

    public function getExceptionListener()
    {
        return $this->exceptionListener;
    }

    public function getListeners()
    {
        return $this->listeners;
    }

    public function getHandlingListener()
    {
        return $this->handlingListener;
    }

    private function getReason($listener, Request $request)
    {
        $ref = new \ReflectionClass($listener);

        if ($listener instanceof AbstractAuthenticationListener) {
            // check if method has been overridden
            if ('Symfony\Component\Security\Http\Firewall\AbstractAuthenticationListener'
                    !== $ref->getMethod('requiresAuthentication')->class) {
                return;
            }

            // requires schmittjoh/symfony, support for symfony/symfony should
            // be added as well
            $class = $ref->getMethod('requiresAuthentication')->getDeclaringClass();
            if ($class->hasProperty('checkPath')) {
                $prop = $class->getProperty('checkPath');
                $prop->setAccessible(true);

                return sprintf('Path did not match. Expected path/route "%s", but got path/route "%s".',
                    $prop->getValue($listener), $this->resolvePath($request, $prop->getValue($listener)));
            }

            return;
        }

        if ('Symfony\Component\Security\Http\Firewall\LogoutListener' === $ref->name) {
            if ($ref->hasProperty('logoutPath')) {
                $prop = $ref->getProperty('logoutPath');
                $prop->setAccessible(true);

                return sprintf('Path did not match. Expected path/route "%s", but got path/route "%s".',
                    $prop->getValue($listener), $this->resolvePath($request, $prop->getValue($listener)));
            }

            return;
        }
    }

    private function resolvePath(Request $request, $path)
    {
        if ('/' !== $path[0]) {
            // copy/paste from HttpUtils, should ideally be avoided by adding a
            // resolve path method there
            try {
                $parameters = $this->router->match($request->getPathInfo());

                return $parameters['_route'];
            } catch (\Exception $e) {
                // do nothing
            }
        }

        return $request->getPathInfo();
    }
}