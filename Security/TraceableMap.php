<?php

namespace JMS\DebuggingBundle\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Security\Http\FirewallMapInterface;

class TraceableMap implements FirewallMapInterface
{
    private $container;
    private $map;
    private $lastTrace;

    public function __construct(ContainerInterface $container, array $map)
    {
        $this->container = $container;
        $this->map = $map;
    }

    public function getListeners(Request $request)
    {
        $trace = array();

        foreach ($this->map as $contextId => $requestMatcher) {
            $matches = null === $requestMatcher || $requestMatcher->matches($request);
            $trace[substr($contextId, strrpos($contextId, '.') + 1)] = array(
                'matches' => $matches,
                'reason' => !$matches ? $requestMatcher->getLastMatch() : null,
            );

            if ($matches) {
                $this->lastTrace = $trace;

                return $this->container->get($contextId)->getContext();
            }
        }

        $this->lastTrace = $trace;

        return array(array(), null);
    }

    public function getLastTrace()
    {
        return $this->lastTrace;
    }
}