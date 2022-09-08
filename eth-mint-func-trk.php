<?php
/*
 * Plugin Name: Ethereum Mint Functions
 * Description: ADD to Wordpress Ethereum Mint Functions
 * Author: TrakaDev
 * Author URI: https://trakadev.com/
 * Text Domain: eth-mint-func-trk-plugin
 * Domain Path: /languages
 * Version: 1.0.0
 * Requires PHP: 7.3
 */

// If this file is access directly, abort!!!
defined('ABSPATH') or die('Unauthorized Access');

/**
 * Plugin Constants
 */

define('emftrk_PATH', trailingslashit(plugin_dir_path(__FILE__)));
define('emftrk_URL', trailingslashit(plugins_url('/', __FILE__)));

/**
 * Loading Scripts
 */

add_action('wp_enqueue_scripts', 'load_emftrk_scripts');

// Add Type Module to Javascript tags
add_filter('script_loader_tag', 'add_type_attribute', 10, 3);

/**
 * It loads the app.js file and app.css file.
 */
function load_emftrk_scripts()
{

    wp_enqueue_script(
        'wp-emftrk-web3',
        "https://unpkg.com/web3@1.2.11/dist/web3.min.js",
        ['jquery'],
        wp_rand(),
        true
    );
    wp_enqueue_script(
        'wp-emftrk-web3modal',
        "https://unpkg.com/web3modal@1.9.0/dist/index.js",
        ['jquery', 'wp-emftrk-web3'],
        wp_rand(),
        true
    );
    wp_enqueue_script(
        'wp-emftrk-evm-chains',
        "https://unpkg.com/evm-chains@0.2.0/dist/umd/index.min.js",
        ['jquery', 'wp-emftrk-web3', 'wp-emftrk-web3modal'],
        wp_rand(),
        true
    );
    wp_enqueue_script(
        'wp-emftrk-walletconnect',
        "https://unpkg.com/@walletconnect/web3-provider@1.2.1/dist/umd/index.min.js",
        ['jquery', 'wp-emftrk-web3', 'wp-emftrk-web3modal', 'wp-emftrk-evm-chains'],
        wp_rand(),
        true
    );
    wp_enqueue_script(
        'wp-emftrk-abi',
        emftrk_URL . 'public/abi.js',
        ['jquery', 'wp-emftrk-web3', 'wp-emftrk-web3modal', 'wp-emftrk-evm-chains', 'wp-emftrk-walletconnect'],
        wp_rand(),
        true
    );
    wp_enqueue_script(
        'wp-emftrk-app',
        emftrk_URL . 'public/connect-btn.js',
        ['jquery', 'wp-emftrk-web3', 'wp-emftrk-web3modal', 'wp-emftrk-evm-chains', 'wp-emftrk-walletconnect', 'wp-emftrk-abi'],
        wp_rand(),
        true
    );


    /*
    wp_enqueue_script(
        'wp-emftrk-app',
        emftrk_URL . 'dist/app.js',
        ['jquery'],
        wp_rand(),
        true
    );
    */

    wp_register_style('emftrk_styles', emftrk_URL . 'public/app.css');
    wp_enqueue_style('emftrk_styles');
}

// Add Type = Module to js 
function add_type_attribute($tag, $handle, $src)
{
    if ('wp-emftrk-app' === $handle) {
        $tag = '<script id="' . $handle . '" type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}

# Activate Logs
/* A function to write logs in the debug.log file. */
if (!function_exists('write_log')) {
    function write_log($log)
    {
        if (true === WP_DEBUG) {
            if (is_array($log) || is_object($log)) {
                error_log(print_r($log, true));
            } else {
                error_log($log);
            }
        }
    }
}
