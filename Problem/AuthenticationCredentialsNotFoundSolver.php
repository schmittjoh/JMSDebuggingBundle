<?php

namespace JMS\DebuggingBundle\Problem;

use JMS\DebuggingBundle\Exception\ObjectNotFoundException;
use JMS\DebuggingBundle\Exception\ClassNotLoadedException;
use JMS\DebuggingBundle\Solution\SimpleBlockSolution;
use JMS\DebuggingBundle\Util\ObjectFinder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationCredentialsNotFoundException;

class AuthenticationCredentialsNotFoundSolver implements ProblemSolverInterface
{
    private $objectFinder;

    public function __construct()
    {
        $this->objectFinder = new ObjectFinder();
    }

    public function solve(Request $request, \Exception $ex)
    {
        if (!$ex instanceof AuthenticationCredentialsNotFoundException) {
            return null;
        }

        try {
            $firewall = $this->objectFinder->find($fClass = 'Symfony\Component\Security\Http\Firewall', $ex);
            $ref = new \ReflectionProperty($fClass, 'map');
            $ref->setAccessible(true);
            $map = $ref->getValue($firewall);

            list($listeners,) = $map->getListeners($request);

            // check if listeners exist
            if ($listeners) {
                return null;
            }

            // firewall configured, but no listeners on that firewall
            return new SimpleBlockSolution('Security is disabled', 'Solution:security_disabled.html.php', array(
                'request' => $request,
            ));
        } catch (ClassNotLoadedException $ex) {
            return $this->createNoFirewallSolution($request);
        } catch (ObjectNotFoundException $ex) {
            return $this->createNoFirewallSolution($request);
        } catch (\Exception $ex) {
            return null;
        }
    }

    private function createNoFirewallSolution($request)
    {
        return new SimpleBlockSolution('No Firewall was configured', 'Solution:no_firewall.html.php', array(
            'request' => $request,
        ));
    }
}