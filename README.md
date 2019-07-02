# Bounce ![npm](https://img.shields.io/npm/v/@firstandthird/bounce.svg)

Simple module to show elements if it appears that user is leaving the page.

## Installation

```sh
npm install @firstandthird/bounce
```

## Usage

### JavaScript

```js
import '@firstandthird/bounce'
```

### HTML

```html
  ...

  <body>
    <div id="modal" data-bounce>
      <div class="overlay" data-bounce-close></div>
      <div class="modal">
        <div class="modal-title">
          <h3>Modal's Title</h3>
        </div>

        <div class="modal-body">
          Modal's body
        </div>
      </div>
    </div>
  </body>
</html>
```

See the [complete example](./example/index.html).
