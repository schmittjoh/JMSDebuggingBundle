<?php

/*
 * Copyright 2011 Johannes M. Schmitt <schmittjoh@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace JMS\DebuggingBundle\Listener;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\HttpKernel\Profiler\Profiler;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

/**
 * Injects the send error report button into exception responses.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
class ResponseListener
{
    private $normalizer;
    private $profiler;
    private $debug;
    private $autoHelp;

    public function __construct(NormalizerInterface $normalizer, Profiler $profiler, $debug = false, $autoHelp = false)
    {
        $this->normalizer = $normalizer;
        $this->profiler = $profiler;
        $this->debug = $debug;
        $this->autoHelp = $autoHelp;
    }

    public function onCoreResponse(FilterResponseEvent $event)
    {
        $exceptionCollector = $this->profiler->get('exception');
        if (!$exceptionCollector->hasException()) {
            return;
        }

        $response = $event->getResponse();
        if (false === $pos = strpos($content = $response->getContent(), '<div class="sf-exceptionreset">')) {
            return;
        }

        // already rendered
        if (false !== strpos($content, '<script language="javascript">jms_install_error_reporting')) {
            return;
        }

        // check if there are any "public" exceptions
        $data = $this->normalizer->normalize($this->profiler, $this->getRequest()->getRequestFormat());
        if (!$data['exception']) {
            return;
        }

        // insert css
        if (false === $pos = strpos($content, '</head>')) {
            return;
        }
        $content = substr($content, 0, $pos).'<style type="text/css">'.file_get_contents(__DIR__.'/../Resources/public/css/error_reporting.css').'</style>'.substr($content, $pos);

        // insert javascript
        if (false === $pos = strpos($content, '</body>')) {
            return;
        }

        $stringData = '';
        foreach ($data as $k => $subData) {
            $level = 2;

            if ('exception' === $k) {
                $level = 4;
            } else if ('events' === $k) {
                $level = 3;
            }

            $stringData .= "\n".Yaml::dump(array($k => $subData), $level);
        }
        $stringData = preg_replace('/\bXXX\b/', '<span class="anonymous">XXX</span>', htmlspecialchars($stringData, ENT_QUOTES, 'UTF-8'));

        $content = substr($content, 0, $pos)
            .(
                $this->debug ?
                    '<script language="javascript" src="http://localhost:9810/compile?id=error-reporting"></script>'
                    :
                    '<script language="javascript">'.file_get_contents(__DIR__.'/../Resources/public/javascript/build/error-reporting.js').'</script>'
            )
            .'<script language="javascript">jms_install_error_reporting('.json_encode(json_encode($data)).', '.json_encode(trim($stringData)).', '.json_encode($this->autoHelp).');</script>'
            .substr($content, $pos);

        $response->setContent($content);
    }
}
