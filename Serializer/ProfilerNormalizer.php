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

namespace JMS\DebuggingBundle\Serializer;

use JMS\DebuggingBundle\Exception\InvalidArgumentException;
use JMS\DebuggingBundle\Exception\RuntimeException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpKernel\DataCollector\EventDataCollector;
use Symfony\Component\HttpKernel\DataCollector\LoggerDataCollector;
use Symfony\Component\HttpKernel\DataCollector\ConfigDataCollector;
use Symfony\Component\HttpKernel\Exception\FlattenException;
use Symfony\Component\HttpKernel\DataCollector\ExceptionDataCollector;
use Symfony\Component\Serializer\Normalizer\SerializerAwareNormalizer;
use Symfony\Component\HttpKernel\Profiler\Profiler;

class ProfilerNormalizer extends SerializerAwareNormalizer
{
    private $kernel;

    public function __construct(KernelInterface $kernel)
    {
        $this->kernel = $kernel;
    }

    public function normalize($profiler, $format = null)
    {
        if (!$this->supportsNormalization($profiler, $format)) {
            throw new InvalidArgumentException(sprintf('$profiler, and/or $format are not supported.'));
        }

        $data = array();
        foreach ($profiler->all() as $name => $collector) {
            if ($collector instanceof ExceptionDataCollector) {
                $data[$name] = $this->getExceptionData($collector);
            } else if ($collector instanceof ConfigDataCollector) {
                $data[$name] = $this->getConfigData($collector);
//            } else if ($collector instanceof EventDataCollector) {
//                $data[$name] = $this->getEventData($collector);
            }
        }

        return $data;
    }

    public function denormalize($data, $class, $format = null)
    {
        throw new RuntimeException('denormalize() is currently not implemented');
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Profiler;
    }

    public function supportsDenormalization($data, $type, $format = null)
    {
        return false;
    }

    private function getEventData(EventDataCollector $collector)
    {
        $data = array(
            'called'     => array(),
            'not_called' => array(),
        );

        foreach ($collector->getCalledListeners() as $key => $listener) {
            if (!$this->isNamespaceWhitelisted($listener['class'])) {
                $listener['class'] = 'XXX';
            }

            $data['called'][] = $listener;
        }

        foreach ($collector->getNotCalledListeners() as $key => $listener) {
            if (!$this->isNamespaceWhitelisted($listener['class'])) {
                $listener['class'] = 'XXX';
            }

            $data['not_called'][] = $listener;
        }

        return $data;
    }

    private function getConfigData(ConfigDataCollector $collector)
    {
        $data = array(
            'symfony_version' => $collector->getSymfonyVersion(),
            'os'              => PHP_OS,
            'php_version'     => $collector->getPhpVersion(),
            'php_extensions'  => get_loaded_extensions(),
            'debug'           => $collector->isDebug(),
            'xdebug'          => $collector->hasXDebug(),
            'eaccelerator'    => $collector->hasEAccelerator(),
            'apc'             => $collector->hasApc(),
            'xcache'          => $collector->hasXCache(),
            'bundles'         => array(),
        );

        foreach (array_keys($collector->getBundles()) as $bundleName) {
            $class = get_class($this->kernel->getBundle($bundleName));
            if ($this->isNamespaceWhitelisted($class)) {
                $data['bundles'][$bundleName] = $class;
                continue;
            }

            $data['bundles'][] = 'XXX';
        }

        return $data;
    }

    private function getExceptionData(ExceptionDataCollector $collector)
    {
        $exception = $collector->getException();
        if (!$exception instanceof FlattenException) {
            $exception = FlattenException::create($exception);
        }

        $data = $exception->toArray();

        foreach ($data as $nb => $exData) {
            // skip non-public exceptions
            $class = new \ReflectionClass($exData['class']);
            if ($class->isUserDefined() && !$this->isNamespaceWhitelisted($exData['class'])) {
                unset($data[$nb]);
                continue;
            }

            // skip built-in exceptions that are thrown from a non-public class
            if (!$class->isUserDefined() && (!isset($exData['trace'][1]) || !$this->isNamespaceWhitelisted($exData['trace'][1]['class']))) {
                unset($data[$nb]);
                continue;
            }

            foreach ($exData['trace'] as $key => $trace) {
                unset($data[$nb]['trace'][$key]['namespace'], $data[$nb]['trace'][$key]['short_class']);

                if ('' === $trace['class']) {
                    $public = isset($exData['trace'][$key+1]) && $this->isNamespaceWhitelisted($exData['trace'][$key+1]['class']);
                } else {
                    $public = $this->isNamespaceWhitelisted($trace['class']);
                }

                if (!$public) {
                    foreach ($trace as $k => $v) {
                        if (is_array($v)) {
                            $data[$nb]['trace'][$key][$k] = array();
                        } else if (is_string($v)) {
                            if ('' !== $v) {
                                $data[$nb]['trace'][$key][$k] = 'XXX';
                            }
                        } else {
                            $data[$nb]['trace'][$key][$k] = 'XXX';
                        }
                    }

                    continue;
                }

                // additional heuristics for config data handling
                if ('Symfony\Component\DependencyInjection\Loader\YamlFileLoader' === $trace['class'] && 'parseImports' === $trace['function']) {
                    $trace['args'] = array(
                        array('array', array()),
                        array('string', basename($trace['args'][1][1]))
                    );
                }
                if (('Symfony\Component\Yaml\Parser' === $trace['class'] && 'parse' === $trace['function'])) {
                    $trace['args'] = array(
                        array('string', 'XXX'),
                    );
                }

                $data[$nb]['trace'][$key]['file'] = basename($trace['file']);
                $data[$nb]['trace'][$key]['args'] = $this->purgeArgsRecursive($trace['args']);
            }
        }

        return array_values($data);
    }

    private function isNamespaceWhitelisted($class)
    {
        return 0 === strpos($class, 'Symfony\\')
               || 0 === strpos($class, 'JMS\\SecurityExtraBundle\\')
               || 0 === strpos($class, 'Sensio\\Bundle\\FrameworkExtraBundle\\')
               || 0 === strpos($class, 'Assetic\\')
               || 0 === strpos($class, 'Doctrine\\')
               || 0 === strpos($class, 'Monolog\\')
               || 0 === strpos($class, 'Metadata\\')
               || 0 === strpos($class, 'Twig_')
               || 0 === strpos($class, 'Swift_')
        ;
    }

    private function purgeArgsRecursive(array $args)
    {
        foreach ($args as $k => $v) {
            list($type, $value) = $v;

            if ('object' === $type && !$this->isNamespaceWhitelisted($value)) {
                $value = 'XXX';
            } else if ('array' === $type && is_array($value)) {
                $value = $this->purgeArgsRecursive($value);
            } else if ('string' === $type) {
                if ($this->isFilePath($value)) {
                    $value = basename($value);
                }
            }

            $args[$k] = array($type, $value);
        }

        return $args;
    }

    private function isFilePath($value)
    {
        // windows file paths: C:\ D:\ etc.
        if (preg_match('#^[a-zA-Z]:\\\\#', $value)) {
            return true;
        }

        // all other file paths, just check if string ends with a possible file name /file.php
        return preg_match('#(?:/|\\\\)([^/\\\\]+)\.(?:php|xml|yml|twig|js|css|ini)$#', $value) > 0;
    }
}
