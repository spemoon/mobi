module.exports = function(grunt) {

    var server = 'http://localhost/mobi/';

    grunt.initConfig({
        // 代码检查
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                newcap: false,
                noarg: false,
                undef: false,
                sub: false,
                boss: false,
                evil: false
            },
            uses_defaults: ['js/**/*.js', '!js/lib/util/lang.js', '!js/lib/util/ajax.js'],
            useEval: { // 允许使用eval或者new Function
                options: {
                    evil: true
                },
                files: {
                    src: ['js/lib/util/lang.js', 'js/lib/util/ajax.js']
                }
            }
        },
        // 转化
        transport: {
            options: {
                format: 'public/js/dist/{{filename}}'
            },
            app: {
                files: {
                    'js/.build': 'js/src/**/*.js'
                }
            }
        },
        // 合并
        concat: {
            app: {
                options: {
                    relative: true
                },
                files: {
                }
            }
        },
        // 压缩
        uglify: {
            app: {
                files: {
                }
            }
        },
        // 清理
        clean: {
            build: ['.build']
        },
        // 单元测试
        qunit: {
            net: {
                options: {
                    urls: [ server + 'test/lib/util/ajax/index.html']
                }
            },
            all: ['test/**/*.html', '!test/lib/util/ajax/index.html']
        },
        // 文件监听
        watch: {
            files: 'test/**/*.js',
            tasks: ['qunit']
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['qunit', 'watch']);
}
