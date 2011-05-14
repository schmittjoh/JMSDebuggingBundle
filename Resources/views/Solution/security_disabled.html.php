The firewall which was configured for URI "<?php echo $request->getPathInfo() ?>" has
security disabled. Thus you cannot perform any security related checks during
the request.
<br /><br/>
In order to solve this, please turn security on:

<pre>
security:
    # ...
    firewalls:
        somename:
            security: true
</pre>