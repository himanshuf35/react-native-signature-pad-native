import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Canvas,
  useCanvasRef,
  Skia,
  Path,
  useTouchHandler,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
} from '@shopify/react-native-skia';

type SignaturePadProps = {
  style?: StyleProp<ViewStyle>;
  existingSignatureSvg?: string;
  strokeColor?: string;
  onDrawingEnd: (result: SignatureResult) => void;
  strokeWidth?: number;
};

export type SignatureResult = {
  image: string;
  signaturePathSvg: string;
};

export type SignaturePadMethods = {
  clear: () => void;
  getResult: () => SignatureResult;
};

const getPaint = (strokeWidth: number, color: string) => {
  const paint = Skia.Paint();
  paint.setStrokeWidth(strokeWidth);
  paint.setStrokeMiter(1);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setAntiAlias(true);
  const _color = paint.copy();
  _color.setColor(Skia.Color(color));
  return _color;
};

const SignaturePad = React.forwardRef<SignaturePadMethods, SignaturePadProps>(
  (
    {
      style,
      strokeWidth = 3,
      strokeColor = 'black',
      existingSignatureSvg = null,
      onDrawingEnd,
    },
    ref
  ) => {
    const canvasRef = useCanvasRef();
    const startPointRef = useRef({ x: 0, y: 0 });
    const path = useRef(
      existingSignatureSvg
        ? Skia.Path.MakeFromSVGString(existingSignatureSvg) ?? Skia.Path.Make()
        : Skia.Path.Make()
    ).current;
    const paint = useRef(getPaint(strokeWidth, strokeColor)).current;
    const touchState = useRef(false);

    const parseResult = useCallback(() => {
      const rawBase64 = canvasRef?.current
        ?.makeImageSnapshot()
        ?.encodeToBase64();
      const image = `data:image/png;base64,${rawBase64}`;
      return { image: image, signaturePathSvg: path.toSVGString() };
    }, [canvasRef, path]);

    const onDrawingStart = useCallback(
      (touchInfo: { x: number; y: number }) => {
        const { x, y } = touchInfo;
        touchState.current = true;
        startPointRef.current = { x, y };
        path?.moveTo(x, y);
      },
      [path]
    );

    const onDrawingActive = useCallback(
      (touchInfo: { x: number; y: number }) => {
        const { x, y } = touchInfo;
        if (touchState.current) {
          path.lineTo(x, y);
        }
      },
      [path]
    );

    const onDrawingFinished = useCallback(
      (touchInfo: { x: number; y: number }) => {
        const { x, y } = touchInfo;
        touchState.current = false;
        if (
          Math.abs(startPointRef.current.x - x) >= 1 ||
          Math.abs(startPointRef.current.y - y) >= 1
        ) {
          onDrawingEnd(parseResult());
        }
      },
      [onDrawingEnd, parseResult]
    );

    const onClear = useCallback(() => {
      path.reset();
      canvasRef?.current?.redraw();
    }, [canvasRef, path]);

    useImperativeHandle(
      ref,
      useCallback(
        () => ({
          clear: onClear,
          getResult: parseResult,
        }),
        [onClear, parseResult]
      )
    );

    const touchHandler = useTouchHandler({
      onActive: onDrawingActive,
      onStart: onDrawingStart,
      onEnd: onDrawingFinished,
    });

    return (
      <View style={[styles.flex1, style]}>
        <Canvas style={styles.flex1} ref={canvasRef} onTouch={touchHandler}>
          <Path path={path} paint={paint} />
        </Canvas>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});

export default React.memo(SignaturePad);
