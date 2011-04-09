<?php
/**
 * Portions of this code are from the Symfony2 Framework,
 * received under the MIT license.
 */
?>
<div class="block">
    <?php if ($previousCount > 0): ?>
        <h2>
            <span><small>[<?php echo $previousCount - $position + 1 ?>/<?php echo $previousCount + 1?>]</small></span>
            <?php echo $codeHelper->abbrClass($e['class']) ?>: <?php echo nl2br(htmlspecialchars($e['message'], ENT_QUOTES, 'UTF-8')) ?>&nbsp;
            <a href="#" onclick="toggle('traces_<?php echo $position ?>', 'traces'); switchIcons('icon_traces_<?php echo $position ?>_open', 'icon_traces_<?php echo $position ?>_close'); return false;"><img class="toggle" id="icon_traces_<?php echo $position ?>_close" alt="-" src="data:image/gif;base64,R0lGODlhEgASAMQSANft94TG57Hb8GS44ez1+mC24IvK6ePx+Wa44dXs92+942e54o3L6W2844/M6dnu+P/+/l614P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABIALAAAAAASABIAQAVCoCQBTBOd6Kk4gJhGBCTPxysJb44K0qD/ER/wlxjmisZkMqBEBW5NHrMZmVKvv9hMVsO+hE0EoNAstEYGxG9heIhCADs=" style="visibility: <?php echo 0 === $previousCount ? 'display' : 'hidden' ?>" /><img class="toggle" id="icon_traces_<?php echo $position ?>_open" alt="+" src="data:image/gif;base64,R0lGODlhEgASAMQTANft99/v+Ga44bHb8ITG52S44dXs9+z1+uPx+YvK6WC24G+944/M6W28443L6dnu+Ge54v/+/l614P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABMALAAAAAASABIAQAVS4DQBTiOd6LkwgJgeUSzHSDoNaZ4PU6FLgYBA5/vFID/DbylRGiNIZu74I0h1hNsVxbNuUV4d9SsZM2EzWe1qThVzwWFOAFCQFa1RQq6DJB4iIQA7" style="visibility: <?php echo 0 == $previousCount ? 'hidden' : 'display' ?>; margin-left: -18px" /></a>
        </h2>
    <?php else: ?>
        <h2>Stack Trace</h2>
    <?php endif ?>

    <a id="traces_link_<?php echo $position ?>"></a>
    <ol class="traces list_exception" id="traces_<?php echo $position ?>" style="display: <?php echo 0 == $previousCount ? 'block' : 'none' ?>">
        <?php foreach ($e['trace'] as $i => $trace): ?>
            <li>
                <?php include __DIR__.'/trace.html.php' ?>
            </li>
        <?php endforeach ?>
    </ol>
</div>