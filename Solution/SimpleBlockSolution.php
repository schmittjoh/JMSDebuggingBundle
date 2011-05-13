<?php

namespace JMS\DebuggingBundle\Solution;

use Symfony\Component\HttpFoundation\Response;

class SimpleBlockSolution extends AbstractSolution
{
    private $content;

    public function __construct($title, $template, array $vars = array())
    {
        $this->content = $this->render('Solution:block.html.php', array(
            'title'   => $title,
            'content' => $this->render($template, $vars),
        ));
    }

    protected function getContent()
    {
        return $this->content;
    }
}