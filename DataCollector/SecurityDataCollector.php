<?php

namespace JMS\DebuggingBundle\DataCollector;

use JMS\DebuggingBundle\Security\TraceableFirewall;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\DataCollector\SecurityDataCollector
    as BaseSecurityDataCollector;

class SecurityDataCollector extends BaseSecurityDataCollector
{
    private $firewall;

    public function setFirewall(TraceableFirewall $firewall)
    {
        $this->firewall = $firewall;
    }

    public function collect(Request $request, Response $response, \Exception $ex = null)
    {
        parent::collect($request, $response, $ex);

        $this->data['context_trace'] = $this->firewall->getContextTrace();

        $listeners = array();
        $listenerTrace = $this->firewall->getListenerTrace();
        $handlingListener = $this->firewall->getHandlingListener();
        foreach ($this->firewall->getListeners() as $listener) {
            $data = array(
                'class' => $class = get_class($listener),
                'short_name' => substr($class, strrpos($class, '\\') + 1),
                'called' => isset($listenerTrace[$listener]),
                'reason' => isset($listenerTrace[$listener]) ? $listenerTrace[$listener]['reason'] : null,
                'handled' => $listener === $handlingListener,
            );

            $listeners[] = $data;
        }
        $this->data['listeners'] = $listeners;
    }

    public function getContextTrace()
    {
        return $this->data['context_trace'];
    }

    public function getListeners()
    {
        return $this->data['listeners'];
    }
}