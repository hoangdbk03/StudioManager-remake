import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import AxiosIntance from "../util/AxiosIntance";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { IconButton, Searchbar } from "react-native-paper";
import { useCallback } from 'react';
import ItemListContractStaff from './ItemListContractStaff';
import unorm from 'unorm';

const ContractStaff = () => {
  const [dataContract, setDataContract] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query) => setSearchQuery(query);

  // TODO: lấy danh sách hợp đồng
  const fetchDataContract = async () => {
    try {
      const response = await AxiosIntance().get("/contract/list/");
      const apiData = response;
      setDataContract(apiData);
    } catch (error) {
      console.log("Lỗi lấy danh sách hợp đồng");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDataContract();
    }, [])
  );

    // Chuẩn hóa chuỗi sang Unicode NFD
    const normalizedSearchQuery = unorm.nfkd(searchQuery.toLowerCase());

    // Lọc dữ liệu dựa trên chuỗi tìm kiếm đã được chuẩn hóa
    const filteredData = dataContract.filter((item) => {
      const normalizedDataName = unorm.nfkd(item.clientId.name.toLowerCase());
      return normalizedDataName.includes(normalizedSearchQuery);
    });

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          padding: 10
        }}
      >
        <Searchbar
          placeholder="Tìm kiếm"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={{ borderRadius: 10, width: "100%" }}
          icon={() => <IconButton icon="calendar" />}
        />
      </View>

      {/* Danh sách hợp đồng */}
      <FlatList
        style={{ backgroundColor: "white", marginBottom: "21%" }}
        data={filteredData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ItemListContractStaff item={item} />}
      />
    </View>
  )
}

export default ContractStaff

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
})