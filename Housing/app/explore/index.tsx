import React, { useCallback, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Explore from './Explore';
import Detail from './CURD/Detail';
import { Text, View } from 'react-native';


const index = () => {
  return (

    <View>
      <Explore />
    </View>
  );
};

export default index;