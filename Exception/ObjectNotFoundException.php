<?php

namespace JMS\DebuggingBundle\Exception;

class ObjectNotFoundException extends RuntimeException
{
    public function __construct($class)
    {
        parent::__construct(sprintf('No object of class "%s" was found.', $class));
    }
}