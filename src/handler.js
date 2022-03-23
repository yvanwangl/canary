import BrowserWindow from 'sketch-module-web-view';
import { getWebview } from 'sketch-module-web-view/remote';
import fetch from 'sketch-polyfill-fetch';
import UI from 'sketch/ui';
import sketch from 'sketch/dom';
import Settings from 'sketch/settings';
import uuidv4 from 'uuid/v4';

const webviewIdentifier = 'canary.webview';
const Document = sketch.Document;
const Image = sketch.Image;

export default function onRun(context) {
  // 判断是否是新用户
  if (!Settings.settingForKey('canary-uuid')) {
    const uuid = uuidv4();
    Settings.setSettingForKey('canary-uuid', uuid);
    // 进行上报
    fetch('', {
      method: 'POST',
      body: {
        'canary-uuid': uuid,
      }
    })
  }
  let browserWindow = BrowserWindow.fromId(webviewIdentifier);
  if (browserWindow) {
    if (browserWindow.isVisible()) {
      browserWindow.minimize();
    } else {
      browserWindow.show();
    }
    return;
  }

  const options = {
    identifier: webviewIdentifier,
    width: 600,
    height: 600,
    fullscreen: true,
  }

  browserWindow = new BrowserWindow(options);

  const webContents = browserWindow.webContents;
  browserWindow._panel.webContents = webContents;
  browserWindow.maximize();

  // print a message when the page loads
  webContents.on('did-finish-load', () => {
    UI.message('UI loaded!')
  })

  webContents.on('export-svg', (svg) => {
    const group = sketch.createLayerFromData(svg, 'svg');
    group.name = `canary-${group.id}`;
    Document.fromNative(context.document).selectedPage.layers.push(group);
    Settings.setDocumentSettingForKey(context.document, group.name, `${svg}`);
    browserWindow.minimize();
  });

  webContents.on('export-png', (png) => {
    console.log(png);
    const pngBase = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIxMjFweCIgaGVpZ2h0PSI0NjFweCIgdmlld0JveD0iLTAuNSAtMC41IDEyMSA0NjEiIGNvbnRlbnQ9IiZsdDtteGZpbGUgaG9zdD0mcXVvdDt5dmFud2FuZ2wuZ2l0aHViLmlvJnF1b3Q7IG1vZGlmaWVkPSZxdW90OzIwMjAtMDMtMjhUMDg6MTU6MTcuNTM3WiZxdW90OyBhZ2VudD0mcXVvdDtNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xM182KSBBcHBsZVdlYktpdC82MDUuMS4xNSAoS0hUTUwsIGxpa2UgR2Vja28pJnF1b3Q7IGV0YWc9JnF1b3Q7VXEwM2NHOHdnbFZwRDdNZlpGcnEmcXVvdDsgdmVyc2lvbj0mcXVvdDsxMi4wLjAmcXVvdDsgdHlwZT0mcXVvdDtkZXZpY2UmcXVvdDsgcGFnZXM9JnF1b3Q7MSZxdW90OyZndDsmbHQ7ZGlhZ3JhbSBpZD0mcXVvdDtYRmdvUHM2aEw5SmlSeGVsQWY4YiZxdW90OyBuYW1lPSZxdW90O+esrCAxIOmhtSZxdW90OyZndDt4WlZiYjRNZ0ZJQi9qWTlMcXZSaVg5ZDJYWlkxNjlLSGJvOVVUNVVVeFNGTzNhOGZLR3FOYmV5V3VMMFkrQTRjNEpPTGdSWkJ0dVk0OGpmTUJXcFlJemN6ME5Ld3JEbXk1RmVCdkFUbVpGd0NqeE5Yb3dic3lCZG9PTkkwSVM3RXJZYUNNU3BJMUlZT0MwTndSSXRoemxuYWJuWmt0RDFxaEQzb2dKMkRhWmZ1aVN2OGt0cldyT0dQUUR5L0d0bWN6c3RJZ0t2R2VpV3hqMTJXbmlHME10Q0NNeWJLVXBBdGdDcDNsWmV5MzhPVmFEMHhEcUc0cFVPOG5yMXQ5dk9jRS85amE1NWU3YWYzNVozTzhvbHBvaGVzSnl2eXlnQm5TZWlDU21JYTZENzFpWUJkaEIwVlRlVXZsOHdYQWRWaG5RNjRnT3pxUE0xNjlYTFhBQXRBOEZ3MjBSMHFYM203bWpiMnpZcjVaK2FubW1IOXc3MDZjZU5FRnJTV0h5aXkraFhKTEhJL1FyOGVIRWZsSmoyU1RDa2R3SmM1NmdxekwvaXloL0tGK24wSlRuRG8wUnVFRGJHZnVuNm1mK2xuM085SFhoV1JLam81SmZMczhYNVBoL0tRUGg5cWdKMlRWeHpkbDBUSUxEQ1lVUFRmUWllM0M0MEZLSEVSY0NMSFZtSUx0RzNxZmFLTGc2dWZxV0Y4amkvNHZIamovVUtvckRZUFRoRTdlN1hSNmhzPSZsdDsvZGlhZ3JhbSZndDsmbHQ7L214ZmlsZSZndDsiPjxkZWZzLz48Zz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiByeD0iOSIgcnk9IjkiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgcG9pbnRlci1ldmVudHM9Im5vbmUiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSIxMjAiIHJ4PSI0MCIgcnk9IjQwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAwMDAiIHBvaW50ZXItZXZlbnRzPSJub25lIi8+PHBhdGggZD0iTSAwIDE4MCBMIDYwIDIyMCBMIDAgMjYwIFoiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBwb2ludGVyLWV2ZW50cz0ibm9uZSIvPjxwYXRoIGQ9Ik0gMCAyOTYgQyAwIDI3NC42NyA2MCAyNzQuNjcgNjAgMjk2IEwgNjAgMzQ0IEMgNjAgMzY1LjMzIDAgMzY1LjMzIDAgMzQ0IFoiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBwb2ludGVyLWV2ZW50cz0ibm9uZSIvPjxwYXRoIGQ9Ik0gMCAyOTYgQyAwIDMxMiA2MCAzMTIgNjAgMjk2IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgcG9pbnRlci1ldmVudHM9Im5vbmUiLz48cGF0aCBkPSJNIDAgMzgwIEwgMTAwIDM4MCBMIDEyMCA0MjAgTCAxMDAgNDYwIEwgMCA0NjAgTCAyMCA0MjAgWiIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHBvaW50ZXItZXZlbnRzPSJub25lIi8+PC9nPjwvc3ZnPg=='
    const image = NSImage.alloc().initWithContentsOfURL(NSURL.URLWithString(pngBase));
    // MSImageData.alloc().initWithImage(image)
    let imageLayer = new Image({
      image: MSImageData.alloc().initWithImage(image)
    });
    // const group = sketch.createLayerFromData(png, 'bitmap');
    // group.name = `canary-${group.id}`;
    Document.fromNative(context.document).selectedPage.layers.push(imageLayer);
    // Settings.setDocumentSettingForKey(context.document, group.name, `${svg}`);
    browserWindow.minimize();
  });

  // add a handler for a call from web content's javascript
  webContents.on('nativeLog', s => {
    UI.message(s)
    webContents
      .executeJavaScript(`setRandomNumber(${Math.random()})`)
      .catch(console.error);
  })

  browserWindow.loadURL('https://yvanwangl.github.io/drawio/src/main/webapp/index.html');
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}

// 导入svg
export const importSvg = () => {
  UI.getInputFromUser(
    "Parse svg",
    {
      initialValue: '',
    },
    (err, value) => {
      if (err) {
        // most likely the user canceled the input
        return
      }
      const group = sketch.createLayerFromData(value, 'bitmap');
      Document.fromNative(context.document).selectedPage.layers.push(group);
    }
  )
};

// 元素选择事件
// export const onSelectionChangedFinish = (context) => {
//   const document = context.actionContext.document;
//   const selection = Document.fromNative(document).selectedLayers;
//   if (selection.length === 1) {
//     selection.forEach(layer => {
//       if (/^canary-/.test(layer.name)) {
//         const svgData = Settings.documentSettingForKey(document, layer.name);
//         let browserWindow = BrowserWindow.fromId(webviewIdentifier);
//         if (browserWindow) {
//           const webContents = browserWindow._panel.webContents;
//           // browserWindow.webContents.executeJavaScript(`importSvg(${svgData})`).catch(console.error);
//           webContents.executeJavaScript(`importSvg(${JSON.stringify({ svgData })})`).catch(console.error);
//         }
//       }
//     });
//   } else {

//   }
// };

// 元素编辑事件
export const editSvg = (context) => {
  const document = context.document;
  const selection = Document.fromNative(document).selectedLayers;
  if (selection.length === 1) {
    selection.forEach(layer => {
      if (/^canary-/.test(layer.name)) {
        const svgData = Settings.documentSettingForKey(document, layer.name);
        let browserWindow = BrowserWindow.fromId(webviewIdentifier);
        if (browserWindow) {
          browserWindow.show();
          const webContents = browserWindow.webContents;
          webContents.executeJavaScript(`importSvg(${JSON.stringify({ svgData })})`).catch(console.error);
        }
      }
    });
  } else {

  }
};

// const sketch = require('sketch/dom');
// const Document = sketch.Document;
// const group = sketch.createLayerFromData(svg, 'svg');

// Document.fromNative(context.document).selectedPage.layers.push(group);
// ui.importXml(svgstring);