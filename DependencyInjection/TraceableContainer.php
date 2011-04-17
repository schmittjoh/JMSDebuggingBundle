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

    public function set($id, $service, $scope = ContainerInterface::SCOPE_CONTAINER)
    {
        if (null === $this->returnedServices) {
            $this->returnedServices = new \SplObjectStorage();
        }

        $rs = parent::set($id, $service, $scope);
        $this->returnedServices->offsetSet($service, $id);

        return $rs;
    }

    public function get($id, $invalid = ContainerInterface::EXCEPTION_ON_INVALID_REFERENCE)
    {
        if (null === $this->returnedServices) {
            $this->returnedServices = new \SplObjectStorage();
        }

        // determine callee
        $backTrace = debug_backtrace(true);
        $callee = null;
        if (isset($backTrace[1]['object'])) {
            if ($this->returnedServices->contains($backTrace[1]['object'])) {
                $callee = array(
                    'type'   => 'service',
                    'id'     => $this->returnedServices->offsetGet($backTrace[1]['object']),
                    'method' => $backTrace[1]['function'],
                );

                if ($callee['id'] === 'service_container') {
                    $callee['method'] = $backTrace[1]['function'];
                }
            } else {
                $callee = array(
                    'type'   => 'object',
                    'class'  => get_class($backTrace[1]['object']),
                    'method' => $backTrace[1]['function'],
                );
            }
        }

        try {
            $service = parent::get($id, $invalid);

            $this->logMessages[] = array(
                'type'    => self::MESSAGE_GET,
                'callee'  => $callee,
                'id'      => $id,
                'created' => !$this->returnedServices->contains($service),
            );

            $this->returnedServices->offsetSet($service, $id);

            return $service;
        } catch (\Exception $ex) {
            $this->logMessages[] = array(
                'type'      => self::MESSAGE_EXCEPTION_ON_GET,
                'exception' => $ex,
                'callee'    => $callee,
                'id'        => $id,
            );

            throw $ex;
        }
    }

    public function getLogMessages()
    {
        return $this->logMessages;
    }
}