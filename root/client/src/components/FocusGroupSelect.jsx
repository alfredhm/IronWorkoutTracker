import React from 'react'
import { FormControl, FormLabel, Box, Text, Select, Tag, TagCloseButton, TagLabel, Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react"
import { useState } from "react"
import { ChevronDownIcon } from '@chakra-ui/icons';
import muscleGroups from '../resources/muscle-groups'

const FocusGroupSelect = (formik) => {
    const [selectedGroups, setSelectedGroups] = useState([])
    
    // Handle adding items to the selectedGroups array
    const handleAddGroup = (newGroup) => {
        if (newGroup && !selectedGroups.includes(newGroup)) {
            setSelectedGroups([...selectedGroups, newGroup]);
            formik.setFieldValue('items', [...selectedGroups, newGroup]); // Update Formik state
        }
    };

    // Handle removing items from the selectedGroups array
    const handleRemoveGroup = (groupToRemove) => {
        const updatedGroups = selectedGroups.filter((group) => group !== groupToRemove);
        setSelectedGroups(updatedGroups);
        formik.setFieldValue('items', updatedGroups); // Update Formik state
    };
    return (
        <>
            <FormControl>
                <FormLabel>Add a Focus Group</FormLabel>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        Choose a Focus Group
                    </MenuButton>
                    <MenuList bg="teal.100" color="black">
                        {muscleGroups
                            .filter((group) => !selectedGroups.includes(group))
                            .map((group) => (
                            <MenuItem 
                                key={group} 
                                onClick={() => handleAddGroup(group)}
                                _hover={{ bg: 'teal.200' }}
                            >
                                {group}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </FormControl>
            <Box>
                {selectedGroups.length > 0 ? (
                selectedGroups.map((group) => (
                    <Tag
                    key={group}
                    size="lg"
                    colorScheme="teal"
                    borderRadius="full"
                    m={1}
                    >
                    <TagLabel>{group}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveGroup(group)} />
                    </Tag>
                ))
                ) : (
                <Text>No Focus Groups Selected</Text>
                )}
            </Box>
        </>
    )
}

export default FocusGroupSelect