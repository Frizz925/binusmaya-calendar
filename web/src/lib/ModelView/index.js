export default class {
    constructor(el, model) {
        this.$el = el.jquery ? $(el) : el;
        this.$model = model;
        this.$views = [];
        this.$init();
    }

    $init() {
        this.$el.find("[data-bind]").each((idx, view) => {
            var $view = $(view);
            var key = $view.attr("data-bind");
            var value = this.$model[key];
            $view.removeAttr("data-bind");

            if ($view.is('input, textarea')) {
                $view.val(this.$model[key]);
                $view.isInput = true;
            } else {
                $view.text(this.$model[key]);
                $view.isInput = false;
            }

            var views = this.$views[key] || [];
            views.push($view);
            this.$views[key] = views;
        });
    }

    publish(key, value) {
        var views = this.$views[key] || [];
        $.each(views, (idx, $view) => {
            if ($view.isInput) {
                $view.val(value);
            } else {
                $view.text(value);
            }
        });
        return this;
    }

    set(key, value) {
        if ($.isPlainObject(key)) {
            $.extend(model, key);
            $.each(key, this.publish);
        } else {
            this.$model[key] = value;
            this.publish(key, value);
        }
        return this;
    };

    get(key) {
        return this.$model[key];
    }
}
