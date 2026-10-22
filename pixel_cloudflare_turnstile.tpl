{if $sitekey}
<div class="pxd-cloudflare-turnstile">
    <div class="cf-turnstile" data-sitekey="{$sitekey}" data-theme="{$theme}" data-action="{$action}" data-appearance="{$appearance}"{if $appearance == 'always'} style="min-height:65px"{/if}></div>
</div>
{/if}
