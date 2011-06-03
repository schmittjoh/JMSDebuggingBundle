<?php

namespace JMS\DebuggingBundle\Problem;

use JMS\DebuggingBundle\Solution\SimpleBlockSolution;
use JMS\DebuggingBundle\Util\ObjectFinder;
use Symfony\Component\DependencyInjection\Exception\ServiceNotFoundException;
use Symfony\Component\HttpFoundation\Request;

class ServiceNotFoundProblemSolver implements ProblemSolverInterface
{
    public function solve(Request $request, \Exception $exception)
    {
        if (!$exception instanceof ServiceNotFoundException) {
            return null;
        }

        try {
            $finder = new ObjectFinder();
            $container = $finder->find('Symfony\Component\DependencyInjection\Container');

            $ids = $container->getServiceIds();
            $searchedId = $exception->getId();

            $similarity = array();
            foreach ($ids as $id) {
                $percentage = 0.0;
                similar_text($id, $searchedId, $percentage);

                if ($percentage >= 90.0) {
                    $similarity[$id] = $percentage;
                }
            }
            arsort($similarity);

            if (!$similarity) {
                return null;
            }

            return new SimpleBlockSolution('Do you have a typo in the service name?', 'Solution:service_name_typo.html.php', array(
                'serviceIds' => $similarity,
            ));
        } catch (\Exception $ex) {
            return null;
        }
    }
}