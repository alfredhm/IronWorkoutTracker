import {
    Box, Tag, TagLabel, TagCloseButton,
    FormControl, Menu, MenuButton, Button,
    MenuList, MenuItem
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import React from 'react';
import muscleGroups from '../resources/muscle-groups';

const FocusSelect = ({ formik }) => {
    const selectedGroups = formik.values.focusGroup || []; // Use Formik's values directly

    // Handle adding items to the selectedGroups array
    const handleAddGroup = (newGroup) => {
        if (newGroup && !selectedGroups.includes(newGroup)) {
            const updatedGroups = [...selectedGroups, newGroup];
            formik.setFieldValue('focusGroup', updatedGroups); // Update Formik value
        }
    };

    // Handle removing items from the selectedGroups array
    const handleRemoveGroup = (groupToRemove) => {
        const updatedGroups = selectedGroups.filter((group) => group !== groupToRemove);
        formik.setFieldValue('focusGroup', updatedGroups); // Update Formik value
    };

    return (
        <>
            <Box pb={1} display="flex" justifyContent="center">
                <Menu textAlign="center">
                    <MenuButton bg="gray.600" color="white" as={Button} rightIcon={<ChevronDownIcon />}>
                        Add Target
                    </MenuButton>
                    <MenuList bg="gray.600" color="white" zIndex={5}>
                        {muscleGroups
                            .filter((group) => !selectedGroups.includes(group))
                            .map((group) => (
                                <MenuItem
                                    key={group}
                                    bg="gray.600"
                                    onClick={() => handleAddGroup(group)}
                                    fontSize="12px"
                                    _hover={{ bg: 'gray.600' }}
                                    fontWeight="700"
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
                ) : null}
            </Box>
        </>
    );
};

export default FocusSelect;
