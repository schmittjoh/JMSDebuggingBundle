<?php

namespace JMS\DebuggingBundle\Solution;

use Symfony\Component\HttpFoundation\Response;

interface SolutionInterface
{
    function apply(Response $response);
}