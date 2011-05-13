<?php

namespace JMS\DebuggingBundle\Problem;

use Symfony\Component\HttpFoundation\Request;

interface ProblemSolverInterface
{
    /**
     * Returns a solution for the given problem.
     *
     * @param Request   $request
     * @param Exception $exception
     *
     * @return Solution|null returns null if the implementation is not able to
     *                       solve this problem
     */
    function solve(Request $request, \Exception $exception);
}