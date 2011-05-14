<?php

namespace JMS\DebuggingBundle\Exception;

class ClassNotLoadedException extends RuntimeException
{
    public function __construct($class)
    {
        parent::__construct(sprintf('The class "%s" is not loaded.', $class));
    }
}