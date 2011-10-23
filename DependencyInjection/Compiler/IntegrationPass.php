<?php

namespace JMS\DebuggingBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Reference;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;

class IntegrationPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        if ($container->hasDefinition('security.firewall')) {
            $this->integrateWithSecurity($container);
        }
    }

    private function integrateWithSecurity(ContainerBuilder $container)
    {
        if ('Symfony\Component\Security\Http\Firewall' !==
                $container->getParameter('security.firewall.class')
                || 'Symfony\Bundle\SecurityBundle\Security\FirewallMap' !==
                $container->getParameter('security.firewall.map.class')
                || 'Symfony\Component\HttpFoundation\RequestMatcher' !==
                $container->getParameter('security.matcher.class')) {
            return;
        }

        $container
            ->getDefinition('security.firewall')
            ->addMethodCall('setRouter', array(new Reference('router')))
        ;

        $container->setParameter('security.firewall.class', 'JMS\DebuggingBundle\Security\TraceableFirewall');
        $container->setParameter('security.firewall.map.class', 'JMS\DebuggingBundle\Security\TraceableMap');
        $container->setParameter('security.matcher.class', 'JMS\DebuggingBundle\HttpFoundation\TraceableRequestMatcher');
    }
}