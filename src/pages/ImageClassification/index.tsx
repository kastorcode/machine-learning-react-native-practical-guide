import React, { useState, useEffect } from 'react'
import { Alert } from 'react-native'
// @ts-ignore
import Tflite from 'tflite-react-native'

import { ChooseFile, TakePicture, Translate } from '~/services'

import { Button, ButtonContainer, ImagePreview, Result, Title } from '~/components'


type RESPONSE = {
  confidence : number,
  index : number,
  label : string
}


const tflite = new Tflite()


function ImageClassification () {
  const [fileUri, setFileUri] = useState('')
  const [result, setResult] = useState('')


  function loadModel () {
    tflite.loadModel({
      model: 'models/mobilenet_v1_1.0_224.tflite',
      labels: 'models/mobilenet_v1_1.0_224.txt',
      numThreads: 1
    },
    (error : string) => {
      if (error) {
        Alert.alert(Translate('error'), Translate('errorLoadModel'))
      }
    })
  }


  function performImageClassification () {
    tflite.runModelOnImage({
      path: fileUri,
      imageMean: 128.0,
      imageStd: 128.0,
      numResults: 3,
      threshold: 0.05
    },
    (error : string, response : RESPONSE[]) => {
      if (error) {
        Alert.alert(Translate('error'), Translate('errorProcessingTflite'))
        return
      }
      let result = ''
      response.map(({ confidence, label }) => {
        result += label.toUpperCase() + ' - ' + (confidence * 100).toFixed(0) + '%\n'
      })
      setResult(result)
    })
  }


  useEffect(() => {
    if (fileUri) {
      performImageClassification()
    }
  }, [fileUri])


  useEffect(() => {
    loadModel()

    return () => {
      tflite.close()
    }
  }, [])


  return (
    <>
    <Title text='pickImagesCG' />
    <ImagePreview uri={fileUri} />
    { result && (
      <Result result={result} />
    ) }
    <ButtonContainer style={{ width: '60%', maxWidth: 300 }}>
      <Button onPress={() => ChooseFile(setFileUri)} text='chooseFile' />
      <Button onPress={() => TakePicture(setFileUri)} text='takePicture' />
    </ButtonContainer>
    </>
  )
}


export default ImageClassification