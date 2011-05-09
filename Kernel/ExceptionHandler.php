<?php

/*
 * Copyright 2011 Johannes M. Schmitt <schmittjoh@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace JMS\DebuggingBundle\Kernel;

use JMS\DebuggingBundle\Listener\ResponseListener;
use JMS\DebuggingBundle\Serializer\ProfilerNormalizer;
use Symfony\Bundle\FrameworkBundle\Templating\Helper\CodeHelper;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\DataCollector\ExceptionDataCollector;
use Symfony\Component\HttpKernel\DataCollector\ConfigDataCollector;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Exception\FlattenException;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpKernel\Profiler\Profiler;

/**
 * Handles exceptions thrown by the Kernel itself.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
class ExceptionHandler
{
    private $kernel;

    public function __construct(KernelInterface $kernel)
    {
        $this->kernel = $kernel;
    }

    public function register()
    {
        set_exception_handler(array($this, 'handle'));
    }

    public function handle(\Exception $exception)
    {
        $request = $this->getRequest($exception);

        $origException = $exception;
        $exception = FlattenException::create($exception);

        $codeHelper = new CodeHelper(null, $this->kernel->getRootDir());
        $title    = $exception->getMessage().' (500 Internal Server Error)';
        $template = 'Exception/exception.html.php';

        ob_start();
        include __DIR__.'/../Resources/views/layout.html.php';
        $content = ob_get_contents();
        ob_end_clean();

        $event = new FilterResponseEvent(new NullHttpKernel(), $request, HttpKernelInterface::MASTER_REQUEST, new Response($content, 500));
        $this->filterResponse($event, $origException);
        $event->getResponse()->send();
    }

    /**
     * Gets the request object from the trace
     *
     * @param \Exception $ex
     * @return Request
     */
    private function getRequest(\Exception $ex)
    {
        $trace = $ex->getTrace();
        $request = null;
        for ($i=count($trace)-1; $i>=0; $i--) {
            if (!isset($trace[$i]['args'][0]) || !is_object($trace[$i]['args'][0])) {
                continue;
            }

            if ($trace[$i]['args'][0] instanceof Request) {
                $request = $trace[$i]['args'][0];
                break;
            }
        }

        return $request;
    }

    private function filterResponse(FilterResponseEvent $event, \Exception $ex)
    {
        $profiler = new Profiler(new NullProfilerStorage());
        $profiler->add(new ConfigDataCollector($this->kernel));
        $profiler->add(new ExceptionDataCollector());
        $profiler->collect($event->getRequest(), $event->getResponse(), $ex);

        $normalizer = new ProfilerNormalizer($this->kernel);
        $listener = new ResponseListener($normalizer, $profiler);
        $listener->onCoreResponse($event);
    }
}
