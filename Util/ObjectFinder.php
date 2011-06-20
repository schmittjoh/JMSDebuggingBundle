<?php

namespace JMS\DebuggingBundle\Util;

use Symfony\Component\HttpKernel\Kernel;

use Symfony\Component\DependencyInjection\ContainerInterface;
use JMS\DebuggingBundle\Exception\ObjectNotFoundException;
use JMS\DebuggingBundle\Exception\ClassNotLoadedException;

/**
 * This class is used to find instantiated objects.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
class ObjectFinder
{
    private $className;
    private $container;

    public function find($className, \Exception $ex = null)
    {
        if (!class_exists($className, false)) {
            throw new ClassNotLoadedException($className);
        }

        $this->className = $className;
        $this->container = null;

        $trace = debug_backtrace(true);
        if (null !== $ex) {
            do {
                $trace = array_merge($trace, $ex->getTrace());
            } while (null !== $ex = $ex->getPrevious());
        }

        for ($i=0, $c=count($trace); $i<$c; $i++) {
            if (!empty($trace[$i]['object'])) {
                if ($trace[$i]['object'] instanceof $className) {
                    return $trace[$i]['object'];
                }
                if ($trace[$i]['object'] instanceof ContainerInterface) {
                    $this->container = $trace[$i]['object'];
                }
                if (null === $this->container && $trace[$i]['object'] instanceof Kernel) {
                    $ref = new \ReflectionProperty($trace[$i]['object'], 'container');
                    $ref->setAccessible(true);
                    $this->container = $ref->getValue($trace[$i]['object']);
                }
            }

            if (isset($trace[$i]['args']) && null !== $obj = $this->scanArgs($trace[$i]['args'])) {
                return $obj;
            }
        }

        // check the DI container
        if (null !== $this->container) {
            $ref = new \ReflectionClass($this->container);
            if ($ref->hasProperty('services')) {
                $prop = $ref->getProperty('services');
                $prop->setAccessible(true);

                foreach ($prop->getValue($this->container) as $service) {
                    if ($service instanceof $className) {
                        return $service;
                    }
                }
            }
        }

        throw new ObjectNotFoundException($className);
    }

    private function scanArgs(array $args)
    {
        foreach ($args as $arg) {
            if (is_array($arg) && null !== $obj = $this->scanArgs($arg)) {
                return $obj;
            } else if (is_object($arg)) {
                if ($arg instanceof $this->className) {
                    return $arg;
                }
                if ($arg instanceof ContainerInterface) {
                    $this->container = $arg;
                }
            }
        }

        return null;
    }
}