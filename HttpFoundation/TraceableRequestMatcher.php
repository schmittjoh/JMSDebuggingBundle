<?php

namespace JMS\DebuggingBundle\HttpFoundation;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestMatcher;

class TraceableRequestMatcher extends RequestMatcher
{
    private static $lastMatch;

    public static function getLastMatch()
    {
        return self::$lastMatch;
    }

    public static function resetLastMatch()
    {
        self::$lastMatch = null;
    }

    public function matches(Request $request)
    {
        $methods = $this->getFieldValue('methods');
        if (null !== $methods && !in_array($request->getMethod(), $methods)) {
            self::$lastMatch = sprintf('Method did not match. Expected one of "%s", but got "%s".', implode($methods), $request->getMethod());

            return false;
        }

        $attributes = $this->getFieldValue('attributes');
        foreach ($attributes as $key => $pattern) {
            if (!preg_match($expected = '#'.str_replace('#', '\\#', $pattern).'#', $request->attributes->get($key))) {
                self::$lastMatch = sprintf(
                    'Attribute "%s" did not match. Expected regex pattern "%s", but got value %s.',
                    $key, $expected, json_encode($request->attributes->get($key))
                );

                return false;
            }
        }

        if (null !== $path = $this->getFieldValue('path')) {
            $path = '#'.str_replace('#', '\\#', $path).'#';

            if (!preg_match($path, $request->getPathInfo())) {
                self::$lastMatch = sprintf(
                    'Path did not match. Expected regex pattern "%s", but got path "%s".',
                    $path,
                    $request->getPathInfo()
                );

                return false;
            }
        }

        $host = $this->getFieldValue('host');
        if (null !== $host && !preg_match($host = '#'.str_replace('#', '\\#', $host).'#', $request->getHost())) {
            self::$lastMatch = sprintf(
                'Host did not match. Expected regex pattern "%s", but got host "%s".',
                $host,
                $request->getHost()
            );

            return false;
        }

        $ip = $this->getFieldValue('ip');
        if (null !== $ip && !$this->checkIp($request->getClientIp(), $ip)) {
            self::$lastMatch = sprintf(
                'IP did not match. Expected pattern "%s", but got "%s".',
                $ip,
                $request->getClientIp()
            );

            return false;
        }

        self::$lastMatch = true;

        return true;
    }

    private function getFieldValue($field)
    {
        $ref = new \ReflectionProperty('Symfony\Component\HttpFoundation\RequestMatcher', $field);
        $ref->setAccessible(true);

        return $ref->getValue($this);
    }
}