// js Document



(function($) {
    "use strict";
    
    
    $(document).on ('ready', function (){


        // --------------------- SVG convert Function
        $('img.svg').each(function(){
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
    
        $.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');
    
            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }
    
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');
            
            // Check if the viewport is set, else we gonna set it if we can.
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }
    
            // Replace image with new SVG
            $img.replaceWith($svg);
    
            }, 'xml');
    
        });


        $('.header-back-button').on('click', function() {
            parent.history.back();
            return false;
        });


        // Mobile menu
        if ($('.close-aside-menu').length) {
          $('.close-aside-menu,.dropdown-overlay').on('click', function () {
            $('.dashboard-sidebar-navigation').removeClass("show-menu");
            $(".dropdown-overlay").removeClass("active");
          });
        };
        if ($('.toggle-show-menu-button').length) {
          $('.toggle-show-menu-button').on('click', function () {
            $('.dashboard-sidebar-navigation').addClass("show-menu");
            $(".dropdown-overlay").addClass("active");
          });
        };
        
        
        // -------------------- Remove Placeholder When Focus Or Click
        $("input,textarea").each( function(){
            $(this).data('holder',$(this).attr('placeholder'));
            $(this).on('focusin', function() {
                $(this).attr('placeholder','');
            });
            $(this).on('focusout', function() {
                $(this).attr('placeholder',$(this).data('holder'));
            });     
        });

        // --------------------- ToolTip
        $('[data-toggle="tooltip"]').tooltip()


        // ----------------------- Dropdown Overlay
        $ ("#main-top-header .dropdown-toggle").on('click', function(){
            $("body").addClass("Overlay-active");
            $(".dropdown-overlay").addClass("active");
        })
        $('.dropdown-overlay,.dropdown-menu').click(function() {
          $('.dropdown-overlay').removeClass('active');  
        })

        // ----------------------- Select js
        $('.theme-select-dropdown').selectric();

        // ---------------------- Popup Page Changer
        $('.continue-button').click(function(){
            $('.modal-navs > li .active').parent('li').next('li').find('a').trigger('click');
            });
        $('.back-button').click(function(){
            $('.modal-navs > li .active').parent('li').prev('li').find('a').trigger('click');
        });

        $('.continue-button-two').click(function(){
            $('.modal-navs-two > li .active').parent('li').next('li').find('a').trigger('click');
            });
        $('.back-button-two').click(function(){
            $('.modal-navs-two > li .active').parent('li').prev('li').find('a').trigger('click');
        });

        // ------------------- Telephone Number Delete
        $(".number-delete-button").on("click", function() {
            $(this).parent(".single-number-input").hide(100);
        });

        // ------------------- Country Select Dropdown
        $("#country").countrySelect();
        // -------------------- Phone Number Select Dropdown
        $("#phone").intlTelInput({
          utilsScript: "vendor/intl-tel/build/js/utils.js"
        });

        // ------------------- Custom Checkbox
        $('input.pay-check').on('change', function() {
            $('input.pay-check').not(this).prop('checked', false);  
        });
        $('input.cur-check').on('change', function() {
            $('input.cur-check').not(this).prop('checked', false);  
        });

        // -------------------- Currnecy Dropdown List
        $(".select-currnecy-list").click(function(e) {
            e.preventDefault();
            var content = $(this).html();
            $('.selected-currency').replaceWith('<div class="balance-sheet-wrapper selected-currency">' + content + '</div>');
          });


        // ----------------------------- Time Frame Slider
        var frame= $(".range-time");
          if(frame.length) {
             frame.ionRangeSlider({
                min: 1,
                max: 12,
                from: 3
              });  
          }
        


        // ------------------------------ Language DropDown 
        var select= $(".theme-dropdown");
          if(select.length) {
             select.chosen({
              no_results_text: "Oops, nothing found!"
            }); 
          }


        // --------------------- Chart 
        if ($('#chartdiv').length) {
          // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("chartdiv", am4charts.XYChart3D);

            // Add data
            chart.data = [{
              "country": "USA",
              "visits": 4025
            }, {
              "country": "China",
              "visits": 3725
            }, {
              "country": "Japan",
              "visits": 3409
            }, {
              "country": "Germany",
              "visits": 3122
            }, {
              "country": "UK",
              "visits": 2822
            }, {
              "country": "France",
              "visits": 2514
            }, {
              "country": "India",
              "visits": 2224
            }, {
              "country": "Spain",
              "visits": 2019
            }, {
              "country": "Netherlands",
              "visits": 1830
            }, {
              "country": "Russia",
              "visits": 1620
            }, {
              "country": "South Korea",
              "visits": 1495
            }, {
              "country": "Canada",
              "visits": 1105
            }, {
              "country": "Brazil",
              "visits": 950
            }, {
              "country": "Italy",
              "visits": 886
            }, {
              "country": "Australia",
              "visits": 784
            }, {
              "country": "Taiwan",
              "visits": 638
            }, {
              "country": "Poland",
              "visits": 528
            }];

            // Create axes
            let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "country";
            categoryAxis.renderer.labels.template.rotation = 270;
            categoryAxis.renderer.labels.template.hideOversized = false;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.renderer.labels.template.horizontalCenter = "right";
            categoryAxis.renderer.labels.template.verticalCenter = "middle";
            categoryAxis.tooltip.label.rotation = 270;
            categoryAxis.tooltip.label.horizontalCenter = "right";
            categoryAxis.tooltip.label.verticalCenter = "middle";

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "Countries";
            valueAxis.title.fontWeight = "bold";

            // Create series
            var series = chart.series.push(new am4charts.ColumnSeries3D());
            series.dataFields.valueY = "visits";
            series.dataFields.categoryX = "country";
            series.name = "Visits";
            series.tooltipText = "{categoryX}: [bold]{valueY}[/]";
            series.columns.template.fillOpacity = .8;

            var columnTemplate = series.columns.template;
            columnTemplate.strokeWidth = 2;
            columnTemplate.strokeOpacity = 1;
            columnTemplate.stroke = am4core.color("#FFFFFF");

            columnTemplate.adapter.add("fill", (fill, target) => {
              return chart.colors.getIndex(target.dataItem.index);
            })

            columnTemplate.adapter.add("stroke", (stroke, target) => {
              return chart.colors.getIndex(target.dataItem.index);
            })

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;

        };

         
    });

    
})(jQuery);
