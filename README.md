# Lifter
Simple but flexible popup library with no dependencies  

## Implementation
**CSS**
```html
<link rel="stylesheet" href="/lifter/dist/lifter.min.css" />
```  
**JavaScript**
```html
<script src="/lifter/dist/lifter.min.js"></script>
```



## Usage

**Basic**
```html
<a href="//domain.com/page.html" target="_popup">Pop this up</a>
```

```javascript
var lifter = new Lifter();
```


**Inline Content**
```html
<div id="popup-content" style="display:none;">
	<form action="/submit" method="POST">
    	<input type="email" name="email" placeholder="Email address" /><br />
        <input type="password" name="password" placeholder="Password" /><br />
        <button type="submit">Log In</button>
    </form>
</div>

<a target="_popup" data-content="#popup-content">Log In</a>
```
```javascript
var lifter = new Lifter({
	preload : ':not([data-content])'
});
```


## Options
```javascript
var lifter = new Lifter({
	triggers : '.popup',
	preload : true
});
```


| Option | Type   | Default | Description |
|--------|--------|---------|-------------|
| **triggers** | string | `'[target=_popup]'` | Selector for the triggers that open popups. |
| **preload** | boolean or string | `true` | Whether to load the popup content in hidden `<iframes>`. If a string selector is given then only triggers that match the selector will be preloaded. |



## Popup Sizing

The default size of the popup is 50% of the total width and height of the base element.
This can be changed per popup in a two different ways.

**Setting popup size with classes**

To use a small or large variant of the popup you can add a class to the trigger.
| Size | Class | Effect |
|------|-------|--------|
| small | `lifter-sm` | width and height set to `30%` |
| large | `lifter-lg` | width and height set to `80%` |

```html
<a href="//domain.com/page.html" target="_popup" class="lifter-lg">Pop this up huge</a>
```


**Setting popup size with data attributes**

To have more control over the size of your popup you can use one of these data attributes:

`data-width` `data-height` `data-size`


You can use any CSS size unit (`px`, `%`, `em`, `vw` ...) in the value of the attribute.

| Dimension | Attribute | Value Format | Example |
|-----------|-----------|--------|---------|
| width | `data-width` | `{width}{unit}` | `data-width="500px"` |
| height | `data-height` | `{height}{unit}` | `data-height="40vh"` |
| width and height | `data-size` | `{width}{unit}|{height}{unit}` | `data-size="75%|450px"` |

_Note:_ `data-size` will overwrite `data-width` or `data-height` if both are set on a trigger element.



## Methods

Under normal use you should not need these methods but here they are just in case you are doing something fancy:


#### lift()

Opens a popup.

`lift(options)`


| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `options` | yes | `object` | Object containing configuration options for the popup. |
| `options.target` | no | `string` | Selector that points to a popup that has been preloaded. |
| `options.html` | no | `string` | Markup that will be shown in the popup if using inline content. |
| `options.src` | no | `string` | URL to load in the popup. |
| `options.classes` | no | `array` | List of classes that will be added to the popup |
| `option.styles` | no | `object` | Key/values that represent styles and their values to be applied to the popup. Styles can be written as standard CSS styles (with hyphens) or as camel case. |
|  |   |   |   |
| `return` | - | `element` or `boolean` | If `target`, `html` and `src` are all `null` then `false` will be returned and no popup will be shown, otherwise, the popup element will be returned |

**Example**
```javascript
var lifter = new Lifter();

lifter.lift({
	src : '//domain.com/page.html',
    classes : [ 'lifter-sm', 'another-class'],
    styles : { max-width : 100%; max-height: 100%; }
});
```


#### lower()
`lower()`

Closes the open popup.


## Styling

Here are the selectors to use in your CSS if you want to customize the look of popups and the overlay behind it:

#### Overlay:
| Selector | State |
|----------|:-----:|
| `.lifter-base::after` | - |
| `.lifter-base.lifting::after` | popup active |

**Example**
```css
.lifter-base::after {
	background-color: #fff;
}
```

#### Popup:
| Selector | State |
|----------|:-----:|
| `.lifter` | - |
| `.lifter.lifting` | popup active |

**Example**
```css
.lifter {
	border-radius: 10000px;
}
.lifter.lifted {
	border-radius: 0;
}
```

_Note:_ `.lifter` transitions all applicable differences in styling between the `.lifter` and `lifter.lifted` selectors by default but this can be overridden if desired through CSS. ( `transition: opacity 150ms ease;` )


## TODO

- [ ] make an example page/site
- [ ] write tests
- [ ] add more pre-set animation styles
- [ ] make docs prettier
