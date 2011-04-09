Overview
========

The main objective of this bundle is to improve your user experience with Symfony2.
Spend less time debugging, and more time solving your actual problems.

Key features include:

- better exception handling while Symfony2 is booting (especially for configuration)
- highly relevant help for errors you encounter
- http://www.screencast.com/users/Johanness/folders/Jing/media/a9049f71-4cd8-4752-97f5-b444ce4af2f1
- http://www.screencast.com/users/Johanness/folders/Jing/media/c24888e8-9629-46b1-8899-aafc49d9672a

Installation
============

Add DebuggingBundle to your vendor/bundles/ dir
-----------------------------------------------

::

    $ git submodule add git://github.com/schmittjoh/DebuggingBundle.git vendor/bundles/JMS/DebuggingBundle

Add the JMS namespace to your autoloader
----------------------------------------

If you are using the Symfony Standard Edition, you can skip this step as this namespace
is already registered.

::

    // app/autoload.php
    $loader->registerNamespaces(array(
        'JMS' => __DIR__.'/../vendor/bundles',
        // your other namespaces
    );

Add DebuggingBundle to your application kernel
----------------------------------------------

::

    // app/AppKernel.php

    public function registerBundles()
    {
        if ($this->isDebug()) {
            // ...
            $bundles[] = new JMS\DebuggingBundle\JMSDebuggingBundle($this);
            // ...
        );
    }

Configuration
=============

Below you find the default configuration for this bundle::

    jms_debugging:
        # You can set this to true if you want to automatically retrieve help 
        # messages for public exceptions. If you leave this set to false, you have
        # to click the "search" button manually each time.
        auto_help: false

