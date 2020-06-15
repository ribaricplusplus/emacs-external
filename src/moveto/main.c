#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <string.h>
#include "cJSON.h"

#define LOG_PATH "/var/log/moveto/log.txt"
#define DESTINATION_COUNT 6
static char* destinations[DESTINATION_COUNT] = {"trash.md", "next.md", "maybe.md", "waiting.md", "completed.org"};
static FILE* flog;

void exitFailure(const char* message){
  fprintf(flog, message);
  exit(EXIT_FAILURE);
}

int getConfigSize(const char* CONFIG_PATH){
  struct stat* buf = malloc(sizeof(struct stat));
  if (stat(CONFIG_PATH, buf) != 0){
    exitFailure("Failed to stat config file.\n");
  }
  int size = buf->st_size;
  free(buf);
  return size;
}

/* Returns config which needs
   to be freed with cJSON_Delete.*/
cJSON* loadConfig(){
  char* HOME = getenv("HOME");
  if (!HOME) {
    exitFailure("Could not get HOME environment variable.\n");
  }
  fprintf(flog, "Path to home is %s\n", HOME);
  char* CONFIG_PATH = strcat(HOME, "/.emacs-config.json");
  fprintf(flog, "Path to config is %s\n", CONFIG_PATH);
  FILE* fconfig = fopen(CONFIG_PATH, "r");
  if (!fconfig){
    exitFailure("Could not open config file.\n");
  }
  int configSize = getConfigSize(CONFIG_PATH);
  char* contents = malloc(configSize+1);
  for(int i = 0; i < configSize; ++i){
    contents[i] = fgetc(fconfig);
  }
  contents[configSize]='\0';
  cJSON* config = cJSON_Parse(contents);
  free(contents);
  fclose(fconfig);
  return config;
}

/* Return value needs to be freed. */
char* getNotebookPath(){
  cJSON* config = loadConfig();
  cJSON* nameItem = cJSON_GetObjectItem(config, "NOTEBOOK_PATH");
  if (!cJSON_IsString(nameItem)){
    exitFailure("Failed to fetch JSON notebook path.\n");
  }
  int size = strlen(nameItem->valuestring);
  char* path = malloc(size+1);
  memcpy(path, nameItem->valuestring, size+1);
  cJSON_Delete(config);
  return path;
}

char* getDestinationPath(int argc, char** argv, char* NOTEBOOK_PATH){
  if (argc > 2){
    exitFailure("Too many arguments.\n");
  }
  int pathValid = 0;
  for (int i = 0; i < DESTINATION_COUNT; ++i){
    if ((strcmp(argv[1], destinations[i])) == 0){
      pathValid = 1;
      break;
    }
  }
  if (!pathValid){
    exitFailure("Invalid path sent as argument.\n");
  }
  char* destination = malloc(strlen(NOTEBOOK_PATH) + strlen("/management/") + strlen(argv[1])+1);
  strcpy(destination, NOTEBOOK_PATH);
  strcat(destination, "/management/");
  strcat(destination, argv[1]);
  fprintf(flog, "Destination path is %s\n", destination);
  return destination;
}

void writeStdinToDestination(char* DESTINATION_PATH){
  FILE* fdest = fopen(DESTINATION_PATH, "a");
  if(!fdest){
    exitFailure("Failed to open destination.\n");
  }
  int ch = fgetc(stdin);
  while(!feof(stdin)){
    fputc(ch, fdest);
    ch = fgetc(stdin);
  }
  fclose(fdest);
}

int main(int argc, char** argv){
  flog = fopen(LOG_PATH, "w");
  fprintf(flog, "Moveto program starting execution.\n");
  char* NOTEBOOK_PATH = getNotebookPath();
  char* DESTINATION_PATH = getDestinationPath(argc, argv, NOTEBOOK_PATH);
  writeStdinToDestination(DESTINATION_PATH);
  free(DESTINATION_PATH);
  free(NOTEBOOK_PATH);
  fclose(flog);
}
