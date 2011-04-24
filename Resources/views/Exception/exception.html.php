<?php
/**
 * Portions of this code are from the Symfony2 Framework,
 * received under the MIT license.
 */
?>
<div class="sf-exceptionreset">

    <div class="block_exception">
        <div class="block_exception_detected clear_fix">
            <div class="illustration_exception">
                <img alt="Exception detected!" src="data:image/gif;base64,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"/>
            </div>
            <div class="text_exception">

                <div class="open_quote">
                    <img alt="" src="data:image/gif;base64,R0lGODlhHAAWAMQQANra2+bl5s3Mzevr6/Pz8+jo6O3t7fHx8c/Oz+Pj49PS093d3djX2NXV1eDf4MrJyvb29gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAcABYAQAWWICSOEDE4AamqRuAsT5yu6hA/wNrcfNysjl5PBOAJAAUDDRLoNRKDndAHnN6k058qaH2QuNelqCAYIm45MfGmIJCkAvUIPNB1td/uAyvEz/UqB0VUagQOZTEjgzx+Kk1CEAU8DAdqB4gPCHVjNwhucphKbzefamAFdlaNEGBZd1V3r1t6fE6wqrJ5XS4Ovb69MyQnv8QhADs="/>
                </div>

                <h1>
                    <?php echo $codeHelper->formatFileFromText(nl2br(htmlspecialchars($exception->getMessage(), ENT_QUOTES, 'UTF-8'))) ?>
                </h1>

                <div>
                    <strong>500</strong> Internal Server Error - <?php echo $codeHelper->abbrClass($exception->getClass()) ?>
                </div>

                <?php $previousCount = count($exception->getAllPrevious()) ?>
                <?php if ($previousCount > 0): ?>
                    <div class="linked"><span><strong><?php echo $previousCount ?></strong> linked Exception<?php if ($previousCount > 1): ?>s<?php endif ?>:</span>
                        <ul>
                            <?php foreach ($exception->getAllPrevious() as $i => $previous): ?>
                                <li>
                                    <?php echo $codeHelper->abbrClass($previous->getClass()) ?> <a href="#traces_link_<?php echo $i + 1 ?>" onclick="toggle('traces_<?php echo $i + 1 ?>', 'traces');">&raquo;</a>
                                </li>
                            <?php endforeach ?>
                        </ul>
                    </div>
                <?php endif ?>

                <div class="close_quote">
                    <img alt="" src="data:image/gif;base64,R0lGODlhHAAWAMQQANra2+bl5s3Mzevr6/Pz8+jo6O3t7fHx8c/Oz+Pj49PS093d3djX2NXV1eDf4MrJyvb29gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAcABYAQAWZoCOO5ACdaECuweO+sIOiDWw36IC8wjH/kAMDVoDYbLJf7ejC/QqvJHBGeC0fAgdhOrsCfDNmFHg9lo9SmvhxRpLXTpSBx6XuXNBjoN4GoNYPaSdtVoCCEIRNhm9iiS6Hjo6BjExxOWN1KAJNQAAvJpkQLS4LVAovfqGeLggQAwlne1MGBQCbqCc2AkV8bigOAQahKQ4DW0AhADs="/>
                </div>

            </div>
        </div>
    </div>

    <?php foreach ($exception->toArray() as $position => $e): ?>
        <?php include __DIR__.'/traces.html.php' ?>
    <?php endforeach ?>

</div>

<script type="text/javascript">//<![CDATA[
    function toggle(id, clazz) {
        var el = document.getElementById(id),
            current = el.style.display,
            i;

        if (clazz) {
            var tags = document.getElementsByTagName('*');
            for (i = tags.length - 1; i >= 0 ; i--) {
                if (tags[i].className === clazz) {
                    tags[i].style.display = 'none';
                }
            }
        }

        el.style.display = current === 'none' ? 'block' : 'none';
    }

    function switchIcons(id1, id2) {
        var icon1, icon2, visibility1, visibility2;

        icon1 = document.getElementById(id1);
        icon2 = document.getElementById(id2);

        visibility1 = icon1.style.visibility;
        visibility2 = icon2.style.visibility;

        icon1.style.visibility = visibility2;
        icon2.style.visibility = visibility1;
    }
//]]></script>
