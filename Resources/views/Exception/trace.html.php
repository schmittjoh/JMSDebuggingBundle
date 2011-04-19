<?php
/**
 * Portions of this code are from the Symfony2 Framework,
 * received under the MIT license.
 */
?>
<?php if (!empty($trace['function'])): ?>
    at
    <strong><abbr title="<?php echo htmlspecialchars($trace['class'], ENT_QUOTES, 'UTF-8') ?>"><?php echo $trace['short_class'] ?></abbr><?php echo $trace['type'].$trace['function'] ?>(</strong><?php echo $codeHelper->formatArgs($trace['args']) ?><strong>)</strong>
    <br />
<?php endif ?>

<?php if (isset($trace['file'], $trace['line'])): ?>
    in <?php echo $codeHelper->formatFile($trace['file'], $trace['line']) ?>&nbsp;
    <a href="#" onclick="toggle('trace_<?php echo $position.'_'.$i ?>'); switchIcons('icon_<?php echo $position.'_'.$i ?>_open', 'icon_<?php echo $position.'_'.$i ?>_close'); return false;"><img class="toggle" id="icon_<?php echo $position.'_'.$i ?>_close" alt="-" src="data:image/gif;base64,R0lGODlhEgASAMQSANft94TG57Hb8GS44ez1+mC24IvK6ePx+Wa44dXs92+942e54o3L6W2844/M6dnu+P/+/l614P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABIALAAAAAASABIAQAVCoCQBTBOd6Kk4gJhGBCTPxysJb44K0qD/ER/wlxjmisZkMqBEBW5NHrMZmVKvv9hMVsO+hE0EoNAstEYGxG9heIhCADs=" style="visibility: <?php echo 0 == $i ? 'display' : 'hidden' ?>" /><img class="toggle" id="icon_<?php echo $position.'_'.$i ?>_open" alt="+" src="data:image/gif;base64,R0lGODlhEgASAMQTANft99/v+Ga44bHb8ITG52S44dXs9+z1+uPx+YvK6WC24G+944/M6W28443L6dnu+Ge54v/+/l614P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABMALAAAAAASABIAQAVS4DQBTiOd6LkwgJgeUSzHSDoNaZ4PU6FLgYBA5/vFID/DbylRGiNIZu74I0h1hNsVxbNuUV4d9SsZM2EzWe1qThVzwWFOAFCQFa1RQq6DJB4iIQA7" style="visibility: <?php echo 0 == $i ? 'hidden' : 'display' ?>; margin-left: -18px" /></a>
    <div id="trace_<?php echo $position.'_'.$i ?>" style="display: <?php echo 0 == $i ? 'block' : 'none' ?>" class="trace">
        <?php echo $codeHelper->fileExcerpt($trace['file'], $trace['line']) ?>
    </div>
<?php endif ?>