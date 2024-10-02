import { Box, Tag, TagLabel, TagCloseButton, FormControl, Menu, MenuButton, Button, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import React, { useState } from 'react'
import muscleGroups from '../resources/muscle-groups'

const FocusSelect = ({ formik, focusValues }) => {
    const [selectedGroups, setSelectedGroups] = useState(focusValues ? [...focusValues] : [])

    // Handle adding items to the selectedGroups array
    const handleAddGroup = (newGroup) => {
        if (newGroup && !selectedGroups.includes(newGroup)) {
            const updatedGroups = [...selectedGroups, newGroup]
            setSelectedGroups(updatedGroups);
            formik.setFieldValue('focusGroup', updatedGroups);
        }
    };

    // Handle removing items from the selectedGroups array
    const handleRemoveGroup = (groupToRemove) => {
        const updatedGroups = selectedGroups.filter((group) => group !== groupToRemove);
        setSelectedGroups(updatedGroups);
        formik.setFieldValue('focusGroup', updatedGroups);
    };

    return (
        <FormControl pb={1}>
            <Box pb={1} display="flex" justifyContent="center">
                <Menu>
                    <MenuButton bg="gray.600" color="gray.200" as={Button} rightIcon={<ChevronDownIcon />}>
                        Add Target
                    </MenuButton>
                    <MenuList bg="gray.100" color="black" zIndex={5}>
                        {muscleGroups
                            .filter((group) => !selectedGroups.includes(group))
                            .map((group) => (
                            <MenuItem 
                                key={group} 
                                bg="gray.100"
                                onClick={() => handleAddGroup(group)}
                                fontSize="12px"
                                _hover={{ bg: 'gray.300' }}
                            >
                                {group}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </Box>
            <Box pb={1} minWidth="150px" textAlign="center">
                {selectedGroups.length > 0 ? (
                selectedGroups.map((group) => (
                    <Tag
                    key={group}
                    size="lg"
                    bg="gray.500"
                    color="gray.100"
                    borderRadius="full"
                    m={1}
                    >
                    <TagLabel>{group}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveGroup(group)} />
                    </Tag>
                ))
                ) : (<></>)}
            </Box>
        </FormControl>
    )
}

export default FocusSelect