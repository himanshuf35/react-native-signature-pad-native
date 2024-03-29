# react-native-signature-pad-native

React-Native package to draw signature

## Installation

```sh
npm install react-native-signature-pad-native
```

## Usage

```tsx

import SignaturePad, {
  SignatureResult,
  SignaturePadMethods,
} from 'react-native-signature-pad-native';

 const signatureRef = useRef<SignaturePadMethods>(null);
 const [signatureImage, setSignatureImage] = React.useState<string>('');
 const [signatureSvg, setSignatureSvg] = React.useState<string>('');

 const onDrawingEnd = React.useCallback((result: SignatureResult) => {
    setSignatureSvg(result.signaturePathSvg);
    setSignatureImage(result.image);
  }, []);

  const onClear = React.useCallback(() => {
    signatureRef.current?.clear();
  }, []);


<SignaturePad
    ref={signatureRef}
    onDrawingEnd={onDrawingEnd}
    existingSignatureSvg={signatureSvg}
    style={styles.signatureContainer}
/>

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
