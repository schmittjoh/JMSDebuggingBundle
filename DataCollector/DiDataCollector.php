<?php

namespace JMS\DebuggingBundle\DataCollector;

use Symfony\Component\DependencyInjection\Compiler\AnalyzeServiceReferencesPass;

use Symfony\Component\HttpKernel\DataCollector\DataCollector;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

class DiDataCollector extends DataCollector
{
    private $container;
    private $containerBuilder;

    public function collect(Request $request, Response $response, \Exception $ex = null)
    {
        $this->data['debug'] = $this->container->getParameter('jms.debugging.debug');
        $this->data['container_name'] = $name = $this->generateContainerName();
        $this->data['cache_dir'] = $this->container->getParameter('kernel.cache_dir');
    }

    public function isDebug()
    {
        return $this->data['debug'];
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
                'dependencies' => array(),
            );

            if ($graph->hasNode($id)) {
                $node = $graph->getNode($id);

                foreach ($node->getOutEdges() as $edge) {
                    $services[$id]['dependencies'][] = $edge->getDestNode()->getId();
                }
            }
        }

        return $services;
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

    private function generateContainerName()
    {
        $c = $this->container;

        return $c->getParameter('kernel.name').ucfirst($c->getParameter('kernel.environment')).($c->getParameter('kernel.debug')?'Debug':'').'ProjectContainer';
    }
}