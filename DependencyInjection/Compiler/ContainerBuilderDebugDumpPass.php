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

namespace JMS\DebuggingBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\Config\ConfigCache;

/**
 * Dumps the ContainerBuilder to a cache file so that it can be used by
 * debugging tools.
 *
 * This piece of code is taken from the first beta release of Symfony 2.
 *
 * @author Ryan Weaver <ryan@thatsquality.com>
 * @author Fabien Potencier <fabien@symfony.com>
 */
class ContainerBuilderDebugDumpPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $cache = new ConfigCache(self::getBuilderCacheFilename($container), false);

        $cache->write(serialize($container));
    }

    /**
     * Calculates the cache filename to be used to cache the ContainerBuilder
     *
     * @param ContainerInterface $container
     * @return string
     */
    static public function getBuilderCacheFilename(ContainerInterface $container)
    {
        $class = $container->getParameter('kernel.container_class');

        return $container->getParameter('kernel.cache_dir').'/'.$class.'Builder.cache';
    }
}
