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

namespace JMS\DebuggingBundle\Listener;

use JMS\DebuggingBundle\Problem\ServiceNotFoundProblemSolver;
use JMS\DebuggingBundle\Problem\AuthenticationCredentialsNotFoundSolver;
use JMS\DebuggingBundle\Problem\RemoteProblemSolver;
use JMS\DebuggingBundle\Serializer\ProfilerNormalizer;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\HttpKernel\Profiler\Profiler;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

/**
 * Injects the send error report button into exception responses.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
class ResponseListener
{
    private $profiler;
    private $problemSolvers;
    private $applied = false;

    public function __construct(ProfilerNormalizer $normalizer, Profiler $profiler, $autoHelp = false)
    {
        $this->profiler = $profiler;

        $this->problemSolvers = array(
            new AuthenticationCredentialsNotFoundSolver(),
            new ServiceNotFoundProblemSolver(),
//            new RemoteProblemSolver($normalizer, $profiler, $autoHelp),
        );
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {
        $exceptionCollector = $this->profiler->get('real_exception');
        if (!$exceptionCollector->hasException()) {
            return;
        }

        $response = $event->getResponse();
        if (false === $pos = strpos($content = $response->getContent(), '<div class="sf-exceptionreset">')) {
            return;
        }

        // check for solution
        $solution = null;
        foreach ($this->problemSolvers as $problemSolver) {
            if (null !== $solution = $problemSolver->solve($event->getRequest(), $exceptionCollector->getException())) {
                break;
            }
        }

        // check if solution found
        if (null === $solution) {
            return;
        }

        // check if already applied
        if ($this->applied) {
            return;
        }
        $this->applied = true;

        $solution->apply($response);
    }
}
