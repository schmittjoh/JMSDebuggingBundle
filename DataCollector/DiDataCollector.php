<?php

namespace JMS\DebuggingBundle\DataCollector;

use Symfony\Component\DependencyInjection\Container;

use JMS\DebuggingBundle\DependencyInjection\TraceableContainer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\Compiler\AnalyzeServiceReferencesPass;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class DiDataCollector extends DataCollector
{
    private $container;
    private $containerBuilder;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function collect(Request $request, Response $response, \Exception $ex = null)
    {
        $this->data['container_name'] = $name = $this->container->getParameter('kernel.container_class');
        $this->data['cache_dir'] = $this->container->getParameter('kernel.cache_dir');
        $this->data['log_messages'] = null;

        if ($this->container instanceof TraceableContainer) {
            $this->data['log_messages'] = $this->container->getLogMessages();
        }
    }

    public function getContainerName()
    {
        return $this->data['container_name'];
    }

    public function getGraph()
    {
        $container = $this->getContainerBuilder();

        // update the service graph
        $pass = new AnalyzeServiceReferencesPass();
        $pass->process($container);

        $graph = $container->getCompiler()->getServiceReferenceGraph();
        $services = array();
        foreach ($container->getDefinitions() as $id => $definition) {
            $services[$id] = array(
                'alias'         => false,
                'public'        => $definition->isPublic(),
                'dependencies'  => array(array(), array(), array(), array()),
            );

            if ($graph->hasNode($id)) {
                $node = $graph->getNode($id);

                foreach ($node->getInEdges() as $edge) {
                    $services[$id]['dependencies'][0][] = $edge->getSourceNode()->getId();
                }

                foreach ($node->getOutEdges() as $edge) {
                    $services[$id]['dependencies'][1][] = $edge->getDestNode()->getId();
                }
            }
        }

        foreach ($container->getAliases() as $id => $alias) {
            $services[$id] = array(
                'alias'         => true,
                'public'        => $alias->isPublic(),
                'dependencies'  => array(array(), array(), array(), array()),
            );

            if ($graph->hasNode($id)) {
                $node = $graph->getNode($id);

                foreach ($node->getInEdges() as $edge) {
                    $services[$id]['dependencies'][0][] = $edge->getSourceNode()->getId();
                }

                foreach ($node->getOutEdges() as $edge) {
                    $services[$id]['dependencies'][1][] = $edge->getDestNode()->getId();
                }
            }
        }

        if (null !== $this->data['log_messages']) {
            foreach ($this->data['log_messages'] as $k => $message) {
                if ($message['caller']['type'] !== 'service') {
                    continue;
                }

                // ignore calls from within the container as these are never weak dependencies
                if ($message['caller']['id'] === 'service_container') {
                    continue;
                }

                if (!in_array($message['id'], $services[$message['caller']['id']]['dependencies'][1], true)) {
                    $services[$message['caller']['id']]['dependencies'][3][] = $message['id'];
                }
                if (!in_array($message['caller']['id'], $services[$message['id']]['dependencies'][2], true)) {
                    $services[$message['id']]['dependencies'][2][] = $message['caller']['id'];
                }
            }
        }

        return $services;
    }

    public function getLogMessages()
    {
        return $this->data['log_messages'];
    }

    public function getContainerBuilder()
    {
        if (null !== $this->containerBuilder) {
            return $this->containerBuilder;
        }

        $path = $this->data['cache_dir'].'/'.$this->data['container_name'].'Builder.cache';
        if (!file_exists($path)) {
            return null;
        }

        return $this->containerBuilder = unserialize(file_get_contents($path));
    }

    public function getName()
    {
        return 'dependency_injection';
    }
}