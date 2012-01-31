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

namespace JMS\DebuggingBundle\Kernel;

use Symfony\Component\HttpKernel\Profiler\ProfilerStorageInterface;
use Symfony\Component\HttpKernel\Profiler\Profile;

class NullProfilerStorage implements ProfilerStorageInterface
{
    public function find($ip, $url, $limit, $method)
    {
        return array();
    }

    public function findChildren($token)
    {
        return array();
    }

    public function read($token)
    {
        return '';
    }

    public function write(Profile $profile)
    {
        return true;
    }

    public function purge()
    {
    }
}
