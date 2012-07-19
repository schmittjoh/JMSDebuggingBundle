<?php

namespace JMS\DebuggingBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TraceableContainer extends Container
{
    const MESSAGE_EXCEPTION_ON_GET = 1;
    const MESSAGE_GET              = 2;

    private $logMessages = array();
    private $returnedServices;
    private $startTime;

    public function set($id, $service, $scope = ContainerInterface::SCOPE_CONTAINER)
    {
        if (null === $this->returnedServices) {
            $this->returnedServices = new \SplObjectStorage();
        }

        $id = strtolower($id);
        $rs = parent::set($id, $service, $scope);
        $this->returnedServices->offsetSet($service, $id);

        return $rs;
    }

    public function get($id, $invalid = ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE)
    {
        if (null === $this->returnedServices) {
            $this->returnedServices = new \SplObjectStorage();
        }

        $id = strtolower($id);

        // determine caller
        $backTrace = debug_backtrace(true);
        $caller = null;
        if (isset($backTrace[1]['object'])) {
            if ($this->returnedServices->contains($backTrace[1]['object'])) {
                $caller = array(
                    'type'   => 'service',
                    'id'     => $this->returnedServices->offsetGet($backTrace[1]['object']),
                    'method' => $backTrace[1]['function'],
                );
            } else {
                $caller = array(
                    'type'   => 'object',
                    'class'  => get_class($backTrace[1]['object']),
                    'method' => $backTrace[1]['function'],
                );
            }
        }

        $message = array();
        $this->logMessages[] = &$message;

        $parentTime = null;
        if (null !== $this->startTime) {
            $parentTime = $this->startTime;
        }
        $this->startTime = microtime(true);
        try {
            $service = parent::get($id, $invalid);

            $message['type'] = self::MESSAGE_GET;
            $message['caller'] = $caller;
            $message['id'] = $id;
            $message['created'] = !$this->returnedServices->contains($service);
            $message['time'] = microtime(true) - $this->startTime;

            $this->returnedServices->offsetSet($service, $id);

            if (null !== $parentTime) {
                $this->startTime = $parentTime + $message['time'];
            } else {
                $this->startTime = null;
            }

            return $service;
        } catch (\Exception $ex) {
            $message['type'] = self::MESSAGE_EXCEPTION_ON_GET;
            $message['exception'] = array(
                'class' => get_class($ex),
                'message' => $ex->getMessage(),
            );
            $message['caller'] = $caller;
            $message['id'] = !is_string($id) ? 'NN' : $id;
            $message['time'] = microtime(true) - $this->startTime;

            if (null !== $parentTime) {
                $this->startTime = $parentTime + $message['time'];
            } else {
                $this->startTime = null;
            }

            throw $ex;
        }
    }

    public function getLogMessages()
    {
        return $this->logMessages;
    }
}