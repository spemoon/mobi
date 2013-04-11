module.exports = function(grunt) {

    grunt.initConfig({
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
            all: ['test/**/*.html']
        },
        watch: {
            files: 'test/**/*.js',
            tasks: ['qunit']
        }
    })

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['qunit', 'watch']);
}
