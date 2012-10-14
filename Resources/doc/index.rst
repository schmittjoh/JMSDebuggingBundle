Overview
========

The main objective of this bundle is to improve your user experience with Symfony2.
Spend less time debugging, and more time solving your actual problems.

Key features include:

- better exception handling while Symfony2 is booting (especially for configuration)
- highly relevant help for errors you encounter
- http://www.screencast.com/users/Johanness/folders/Jing/media/a9049f71-4cd8-4752-97f5-b444ce4af2f1
- http://www.screencast.com/users/Johanness/folders/Jing/media/c24888e8-9629-46b1-8899-aafc49d9672a

Note: This Bundle uses Google Analytics to track usage, however no sensitive/personal data is transfered

Installation
============

Composer
-----------

Add the following dependencies to your projects composer.json file:

::

    "require": {
        # ..
        "jms/debugging-bundle": "dev-master"
        # ..
    }

Add DebuggingBundle to your application kernel
----------------------------------------------

::

    // app/AppKernel.php

    public function registerBundles()
    {
        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            // ...
            $bundles[] = new JMS\DebuggingBundle\JMSDebuggingBundle($this);
            // ...
        }
    }

Change the base class of your dependency injection container
------------------------------------------------------------

If you want to have extended debugging capabilities like which services were 
loaded in which order from which class/service, then you need to change the 
default container base class. This will have a slight runtime performance hit in
the range of about 10-30 micro seconds per service call (only in dev environment!).

::

    // app/AppKernel.php
    
    protected function getContainerBaseClass()
    {
        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            return '\JMS\DebuggingBundle\DependencyInjection\TraceableContainer';
        }

        return parent::getContainerBaseClass();
    }

Configuration
=============

Below you find the default configuration for this bundle::

    jms_debugging:
        # You can set this to true if you want to automatically retrieve help 
        # messages for public exceptions. If you leave this set to false, you have
        # to click the "search" button manually each time.
        auto_help: false

Support the Development
=======================

If you like this bundle, and want to support its development, you can donate
whatever amount you like. You may also include an issue number in the note box
if you want to link your donation directly to that issue. Note however that there
is no guarantee when, or if that feature will be implemented.

.. image:: https://www.paypalobjects.com/WEBSCR-640-20110401-1/en_US/i/btn/btn_donate_SM.gif
   :align: center
   :target: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=G8CSWPSTZFUDN

