import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { Header, Input, Button, Icon, ListItem } from '@rneui/themed';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('productdb.db');

export default function App() {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists product (id integer primary key not null, amounts int, title text);');
    }, () => console.error("Error when creating DB"), updateList);  
  }, []);

  // Save course
  const saveItem = () => {
    if (amount && title) {
      db.transaction(tx => {
          tx.executeSql('insert into product (amounts, title) values (?, ?);', [parseInt(amount), title]);    
        }, () => console.error("Error in Insert"), updateList
      )
    }
    else {
      Alert.alert('Error', 'Type amount and title first');
    }
  }

  // Update courselist
  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from product;', [], (_, { rows }) =>
        setItems(rows._array)
      ); 
      setTitle('');
      setAmount('')
    });
  }

  
  const deleteItem = (id) => {
    db.transaction(
      tx => {
        tx.executeSql(`delete from product where id = ?;`, [id]);
      }, null, updateList
    )    
  }

  const listSeparator = () => {
    return (
      <View
        style={{
          height: 5,
          width: "80%",
          backgroundColor: "#fff",
          marginLeft: "10%"
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header 
      centerComponent={{ text: 'SHOPPING LIST', style: {color: 'white', fontSize: 15 } }}
      />
      <Input 
        placeholder='Product'
        label='Product'
        onChangeText={title => setTitle(title)}
        value={title}/>  
      <Input 
        placeholder='Amount'
        label='Amount' 
        onChangeText={amount => setAmount(amount)}
        value={amount}/>      
      <Button onPress={saveItem} radius="lg"> 
        Save
        <Icon name="save" color="white" />
        </Button>

      <FlatList 
        style={{width : "90%"}}
        keyExtractor={item => item.id.toString()} 
        renderItem={({item}) =>
        <ListItem.Swipeable 
        bottomDivider
        rightContent={(action) => (
          <Button
            containerStyle={{
              flex: 1,
              justifyContent: "center",
            }}
            type="clear"
            icon={{ name: "delete", color: "red" }}
            onPress={() => deleteItem(item.id)}
          />
        )}
        
        >
          <ListItem.Content>
              <ListItem.Title>{item.title}</ListItem.Title>
              <ListItem.Subtitle>{item.amounts}</ListItem.Subtitle>
          </ListItem.Content>
          </ListItem.Swipeable>
        }
        data={items} 
        ItemSeparatorComponent={listSeparator} 
      />      
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
 },
 listcontainer: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  alignItems: 'center'
 },
});
