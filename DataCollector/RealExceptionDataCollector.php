<?php

namespace JMS\DebuggingBundle\DataCollector;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;

class RealExceptionDataCollector extends DataCollector
{
    private $ex;

    public function collect(Request $request, Response $response, \Exception $ex = null)
    {
        $this->ex = $ex;
    }

    public function hasException()
    {
        return null !== $this->ex;
    }

    public function getException()
    {
        return $this->ex;
    }

    public function getName()
    {
        return 'real_exception';
    }
}