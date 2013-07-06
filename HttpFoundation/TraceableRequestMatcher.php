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
        if ($methods && !in_array($request->getMethod(), $methods)) {
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
        if (null !== $host && !preg_match($host = '#'.str_replace('#', '\\#', $host).'#i', $request->getHost())) {
            self::$lastMatch = sprintf(
                'Host did not match. Expected regex pattern "%s", but got host "%s".',
                $host,
                $request->getHost()
            );

            return false;
        }

        // Support old Symfony 2.1 way of doing things.
        if (property_exists('Symfony\Component\HttpFoundation\RequestMatcher', 'ip')) {
            $ips = array($this->getFieldValue('ip'));
            $checkIpClass = 'Symfony\Component\HttpFoundation\RequestMatcher';

        // Support new Symfony 2.3 way of doing things.
        } else {
            $ips = $this->getFieldValue('ips');
            $checkIpClass = 'Symfony\Component\HttpFoundation\IpUtils';
        }

        foreach ($ips as $ip) {
            if (!$checkIpClass::checkIp($request->getClientIp(), $ip)) {
                self::$lastMatch = sprintf(
                    'IP did not match. Expected pattern "%s", but got "%s".',
                    $ip,
                    $request->getClientIp()
                );

                return false;
            }
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
