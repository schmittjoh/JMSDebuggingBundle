<?php

namespace JMS\DebuggingBundle\Solution;

use Symfony\Component\HttpFoundation\Response;

class RichClientSolution implements SolutionInterface
{
    private $css;
    private $js;

    public function __construct($js, $css = null)
    {
        $this->js = $js;
        $this->css = $css;
    }

    public function apply(Response $response)
    {
        $content = $response->getContent();

        if (!empty($this->css) && false !== $pos = strpos($content, '</head>')) {
            $content = substr($content, 0, $pos).$this->css.substr($content, $pos);
        }

        // insert javascript
        if (!empty($this->js) && false !== $pos = strpos($content, '</body>')) {
            $content = substr($content, 0, $pos).$this->js.substr($content, $pos);
        }

        $response->setContent($content);
    }
}