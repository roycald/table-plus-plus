import {stylesFactory, useTheme} from '@grafana/ui';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-enterprise/dist/styles/ag-theme-material.css';
import 'ag-grid-enterprise';
import {AgGridReact} from 'ag-grid-react';
import _ from 'lodash';
import React from 'react';
import './style.css';

const getStyles = stylesFactory(() => {
  return {
    
  };
});

export const SimplePanel: React.FC = (props: object) => {
  const {data, fieldConfig} = props;
  const theme = useTheme();
  const styles = getStyles();

  // moving the row data to a cleaner hirarchy and converting the buffer to an array.
  let maxIndex = 0;
  const rowData = {};
  data.series[0].fields.forEach((field) => {
    rowData[field.name] = field.values.toArray();
    if (rowData[field.name].length > maxIndex) {
      maxIndex = rowData[field.name].length;
    }
  });

  const API_URL = fieldConfig.defaults.custom.update_api;
  const ID_FIELD = fieldConfig.defaults.custom.id_field;
  const VALUE_FIELD = fieldConfig.defaults.custom.value_field;

  // Dynamically defining the column defenitions

  const shouldEnableEditing = (columnName: string, flag: string) => {
    const override = _.find(fieldConfig.overrides, (f) => f.matcher.options === columnName);
    if (!override) {
      return fieldConfig.defaults.custom[flag] === true;
    }
    const property = _.find(override.properties, (o) => o.id === `custom.${flag}`);
    if (!property) {
      return fieldConfig.defaults.custom[flag] === true;
    } else {
      return property.value === true;
    }
  };

  const getEditingParams = (columnName: string) => {
    const override = _.find(fieldConfig.overrides, (f) => f.matcher.options === columnName);
    if (!override) {
      return fieldConfig.defaults.custom['value_enums'].split(',');
    }
    const property = _.find(override.properties, (o) => o.id === `custom.value_enums`);
    if (!property) {
      return fieldConfig.defaults.custom['value_enums'].split(',');
    } else {
      return property.value.split(',');
    }
  };

  const onCellEditCallback = (params) => {
    console.log(params.data[ID_FIELD], params.data[VALUE_FIELD])
    fetch(API_URL, {
      method: 'put',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        id: params.data[ID_FIELD],
        status_code: params.data[VALUE_FIELD],
      }),
    }).catch((e) => console.error(e));
  };

  const onExcelExport = () => {
    const params = {
      sheetName: 'grafana_export',
    };
    gridOptions.api.exportDataAsExcel(params);
  };

  const columnDefs = Object.keys(rowData).map((field) => {
    const editable = shouldEnableEditing(field, 'editable');
    return {
      field,
      resizable: true,
      filter: true,
      editable,
      sortable: true,
      menuTabs: ['filterMenuTab'],
      singleClickEdit: true,
      enableRowGroup: true,
      width: 200,
      minWidth: 200,
      cellEditorSelector: (params) => {
        if (editable) {
          return {component: 'agRichSelectCellEditor',
            params: {
              values: getEditingParams(field),
            },
          };
        }
        return {};
      },
    };
  });

  // TODO: add scrolling
  const formattedRowData = [];
  let index = 0;
  while (index < maxIndex) {
    const row = {};
    Object.keys(rowData).forEach((field) => {
      row[field] = rowData[field][index];
    });
    formattedRowData.push(row);
    index++;
  }

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: formattedRowData,
    defaultColDef: {
      flex: 1,
    },
    suppressDragLeaveHidesColumns: true,
    onCellValueChanged: onCellEditCallback,
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
    autoGroupColumnDef: { minWidth: 200 },
    rowGroupPanelShow: 'always',
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'}}
    >
      <div className={'ag-theme-material'}
        style={{height: '100%', width: '100%', flexGrow: 1}} >
        <AgGridReact gridOptions={gridOptions} />
      </div >
      <button className='pulse'
        onClick={onExcelExport}
        style={{
          height: '10%',
          width: '10%',
          zIndex: 1000,
          alignSelf: 'center',
          margin: '8px'}}
      />
    </div>
  );
};
