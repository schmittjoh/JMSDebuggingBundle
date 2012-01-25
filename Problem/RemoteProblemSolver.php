<?php

namespace JMS\DebuggingBundle\Problem;

use JMS\DebuggingBundle\Solution\RichClientSolution;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\HttpKernel\Profiler\Profiler;
use JMS\DebuggingBundle\Serializer\ProfilerNormalizer;
use Symfony\Component\HttpFoundation\Request;

/**
 * Adds a rich Javascript client which allows to fetch solutions from a remote
 * server.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
class RemoteProblemSolver implements ProblemSolverInterface
{
    private $normalizer;
    private $profiler;
    private $autoHelp;

    public function __construct(ProfilerNormalizer $profilerNormalizer, Profiler $profiler, $autoHelp)
    {
        $this->normalizer = $profilerNormalizer;
        $this->profiler = $profiler;
        $this->autoHelp = $autoHelp;
    }

    public function solve(Request $request, \Exception $exception)
    {
        $data = $this->normalizer->normalize($this->profiler);
        if (!$data['exception']) {
            return null;
        }

        $css = '<style type="text/css">'."\n";
        $css .= file_get_contents(__DIR__.'/../Resources/public/css/error_reporting.css');
        $css .= "\n</style>";

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

        $js = $request->query->has('jms_debug') ?
              '<script language="javascript" src="http://localhost:9810/compile?id=error-reporting"></script>'
              :
              '<script language="javascript">'.file_get_contents(__DIR__.'/../Resources/public/javascript/error-reporting.js').'</script>';
        $js .= '<script language="javascript">jms_install_error_reporting('.json_encode(json_encode($data)).', '.json_encode(trim($stringData)).', '.json_encode($this->autoHelp).');</script>';

        return new RichClientSolution($js, $css);
    }
}
