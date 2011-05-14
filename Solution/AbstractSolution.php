<?php

namespace JMS\DebuggingBundle\Solution;

/**
 * This class contains some useful methods that can be used by concrete
 * implementations.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
use JMS\DebuggingBundle\Exception\InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractSolution implements SolutionInterface
{
    public function apply(Response $response)
    {
        $content = $response->getContent();

        $content = preg_replace(
            '#<div class="block">\s*<h2>Stack Trace</h2>#s',
            $this->getContent().'\\0',
            $content
        );

        $response->setContent($content);
    }

    protected function render($name, array $vars = array())
    {
        $path = __DIR__.'/../Resources/views/'.str_replace(':', '/', $name);
        if (!file_exists($path)) {
            throw new InvalidArgumentException(sprintf('There is no template at "%s".', $path));
        }

        extract($vars, EXTR_SKIP);
        ob_start();
        require $path;
        $content = ob_get_contents();
        ob_end_clean();

        return $content;
    }

    abstract protected function getContent();
}