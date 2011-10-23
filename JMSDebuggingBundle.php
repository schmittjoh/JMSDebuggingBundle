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

namespace JMS\DebuggingBundle;

use JMS\DebuggingBundle\DependencyInjection\Compiler\IntegrationPass;
use Symfony\Component\HttpKernel\KernelInterface;
use JMS\DebuggingBundle\Kernel\ExceptionHandler;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
use JMS\DebuggingBundle\DependencyInjection\Compiler\ContainerBuilderDebugDumpPass;

class JMSDebuggingBundle extends Bundle
{
    private $exceptionHandler;

    public function __construct(KernelInterface $kernel)
    {
        // do not add exception handler when running from CLI
        if ('cli' !== PHP_SAPI || isset($_SERVER['REMOTE_ADDR'])) {
            $this->exceptionHandler = new ExceptionHandler($kernel);
            $this->exceptionHandler->register();
        }
    }

    public function build(ContainerBuilder $container)
    {
        parent::build($container);

        $container->addCompilerPass(new IntegrationPass());
        $container->addCompilerPass(new ContainerBuilderDebugDumpPass(), PassConfig::TYPE_BEFORE_REMOVING);
    }
}